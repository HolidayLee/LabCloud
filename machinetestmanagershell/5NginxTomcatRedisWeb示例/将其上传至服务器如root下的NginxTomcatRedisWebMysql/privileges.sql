show variables like 'char%';
set `character_set_client` = utf8;
set `character_set_connection` = utf8;
set `character_set_database` = utf8;
set `character_set_results` = utf8;
set `character_set_server` = utf8;
use mysql;
update  user set host = '%' where user= 'root';
select host, user from user;
# ��docker_mysql���ݿ��Ȩ����Ȩ��������docker�û�������Ϊ123456��
grant all privileges on *.* to 'root'@'%' identified by '123' with grant option;
# ��һ������һ��Ҫ�У�
flush privileges;