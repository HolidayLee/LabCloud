# !/bin/bash

#��������salve�ڵ�Ľű�
KUBE_master_hostname=docker1


#����Kubernets�����Kubernets Proxy
#�༭ /etc/kubernetes/config
function init_edit_Kubernets_Proxy(){
sed -i 's/KUBE_MASTER="--master=http:\/\/.*:8080"/KUBE_MASTER="--master=http:\/\/'$KUBE_master_hostname':8080"/' /etc/kubernetes/config
}
init_edit_Kubernets_Proxy
