# !/bin/bash

#�޸���������IPӳ�䣬����� /etc/hosts

hostname=cloud2
IP_hostname="172.16.2.144 cloud1
172.16.2.7 cloud2"


function editHosts(){
cat > /etc/hosts <<EOF
$IP_hostname
EOF
}
function eidtHostname(){
cat > /etc/hostname <<EOF
$hostname
EOF
}
editHosts
eidtHostname

