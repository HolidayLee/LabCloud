# !/bin/bash
#�ӽڵ�����
function startSlaveSoftware(){
  for SERVICES in kube-proxy kubelet flanneld docker; do
    systemctl restart $SERVICES
    systemctl enable $SERVICES
    systemctl status $SERVICES
  done
}
startSlaveSoftware