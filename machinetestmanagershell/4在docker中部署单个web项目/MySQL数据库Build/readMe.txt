�����������������ͬһ��Ŀ¼��
Dockerfile �����ļ�
my.cnf  ���ݿ�����ñ����ļ�
privileges.sql ���ݿ����Ȩ�ļ�
schema.sql ��Ŀ���ݿ��ļ�
setup.sh ���ݿ⾵�����������ļ�

������µ����ݿ⾵���ļ�����

docker build -t taxisql:1 /root/zqqDocker/taxisql

���о����ļ�����  -d:��ʾ�Ժ�̨��ʽ���� -pΪ��¶�˿� -eΪ���õĳ�ʼ���� --name����ñ��� ����ɾ����ֹͣ �������Ҫ���еľ���

docker run -d -p 13306:3306 -e MYSQL_ROOT_PASSWORD=123 --name sqlone taxisql:1

�������е�����
docker exec -it contiandID /bin/bash