# !/bin/bash

hostname=cloud1
registryHostname=cloud2
apiserverHostname=cloud1
etcdHostname=cloud1


chmod +x common_init_MsaterSalve_tmp*
#����׼��д���ű��ļ���
function connect(){
  #connect internet
  curl "http://202.193.80.124/" -H "Pragma: no-cache" -H "Origin: http://202.193.80.124" -H "Accept-Encoding: gzip, deflate" -H "Accept-Language: zh-CN,zh;q=0.8" -H "Upgrade-Insecure-Requests: 1" -H "User-Agent: Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.98 Safari/537.36" -H "Content-Type: application/x-www-form-urlencoded" -H "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8" -H "Cache-Control: max-age=0" -H "Referer: http://202.193.80.124/" -H "Connection: keep-alive" --data "DDDDD=g102016452&upass=03141b2b5032ba8c682103364b93ce2a123456781&R1=0&R2=1&para=00&0MKKey=123456" --compressed | grep "Please don't forget to log out after you have finished."
}
function disconnect(){
  #disconnect internet
  curl "http://202.193.80.124/F.htm" -H "Accept-Encoding: gzip, deflate, sdch" -H "Accept-Language: zh-CN,zh;q=0.8" -H "Upgrade-Insecure-Requests: 1" -H "User-Agent: Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.80 Safari/537.36" -H "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8" -H "Referer: http://202.193.80.124/" -H "Connection: keep-alive" --compressed >/dev/null 2>&1
}


#����yumԴ 
function yumupdate(){
disconnect
connect
yum clean all
yum --enablerepo=extras clean metadata
yum -y update
yum install -y deltarpm
yum provides '*/applydeltarpm'
disconnect
}
#һ��yumԴ�ڻ����������Ѿ����º��˵����°汾������Ͳ�������
#yumupdate


#install etcd
function init_edit_etcd.conf(){
connect
yum install -y etcd 
disconnect
sed -i 's/ETCD_NAME=default/ETCD_NAME='$hostname'/' /etc/etcd/etcd.conf
sed -i 's/ETCD_LISTEN_CLIENT_URLS="http:\/\/.*:2379"/ETCD_LISTEN_CLIENT_URLS="http:\/\/0.0.0.0:2379"/;s/ETCD_ADVERTISE_CLIENT_URLS="http:\/\/.*:2379"/ETCD_ADVERTISE_CLIENT_URLS="http:\/\/0.0.0.0:2379"/' /etc/etcd/etcd.conf
}
#install Docker
function init_edit_docker(){
#���þ���·��
cat > /etc/yum.repos.d/virt7-docker-common-release.repo << EOF
[virt7-docker-common-release]
name=virt7-docker-common-release
baseurl=http://cbs.centos.org/repos/virt7-docker-common-release/x86_64/os/
gpgcheck=0
EOF
connect
#Docker��װ
yum -y install --enablerepo=virt7-docker-common-release kubernetes flannel
disconnect
#����registry����⣬��ʾ���Դӽڵ�����ȡ���� ��Ϊregistry�ڵ�
#�༭/etc/sysconfig/docker�ļ� 
sed -i 's/OPTIONS=\x27--selinux-enabled --log-driver=journald --signature-verification=false.*\x27/OPTIONS=\x27--selinux-enabled --log-driver=journald --signature-verification=false --registry-mirror=https:\/\/wzmto2ol.mirror.aliyuncs.com --insecure-registry '$registryHostname':5000 --add-registry '$registryHostname':5000\x27/' /etc/sysconfig/docker
#���ÿ�������������������
systemctl enable docker
systemctl start docker
}
#install kubernetes
#���� /etc/kubernetes/kubelet�ļ�
function init_edit_kubernetes(){
connect
#yum -y install kubernetes
disconnect
#ע�⣺���ڵ�ҲҪ�༭ /etc/kubernetes/kubelet ��Ȼ������ʱ���� 127.0.0.1 �������ڵ������
sed -i 's/KUBELET_ADDRESS="--address=.*"/KUBELET_ADDRESS="--address=0.0.0.0"/;s/KUBELET_HOSTNAME="--hostname-override=.*"/KUBELET_HOSTNAME="--hostname-override='$hostname'"/;s/KUBELET_API_SERVER="--api-servers=http:\/\/.*:8080"/KUBELET_API_SERVER="--api-servers=http:\/\/'$apiserverHostname':8080"/;s/KUBELET_POD_INFRA_CONTAINER="--pod-infra-container-image=.*"/KUBELET_POD_INFRA_CONTAINER="--pod-infra-container-image='$registryHostname':5000\/pod-infrastructure"/;s/KUBELET_ARGS=.*/KUBELET_ARGS="--cluster-dns=10.254.10.2 --cluster-domain=hi --allow-privileged=true"/' /etc/kubernetes/kubelet
}
#install Flannel
#Flannelһ����������ߣ���master�ڵ���slave�ڵ��ж��谲װ
function init_edit_flannel(){
#yum install -y flannel
#master��node�Ͼ��༭/etc/sysconfig/flanneld
#�����docker1Ϊetcd����Ľڵ��������
sed -i 's/FLANNEL_ETCD_ENDPOINTS="http:\/\/.*:2379"/FLANNEL_ETCD_ENDPOINTS="http:\/\/'$etcdHostname':2379"/;s/FLANNEL_ETCD_PREFIX=".*"/FLANNEL_ETCD_PREFIX="\/kube-centos\/network"/' /etc/sysconfig/flanneld
#��master�ڵ�����������FLANNEL_ETCD_PREFIX��Ӧ�ļ�/kube-centos/network��ֵ ������
}
init_edit_etcd.conf
init_edit_docker
init_edit_kubernetes
init_edit_flannel