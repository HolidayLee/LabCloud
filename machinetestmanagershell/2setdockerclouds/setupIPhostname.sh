# !/bin/bash

#�޸���������IPӳ�䣬����� /etc/hosts

hostname=
IP_hostname=

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

