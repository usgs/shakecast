drop database IF EXISTS sc;
create database sc;
grant usage on *.* to sc@localhost identified by 'sc';
grant all privileges on sc.* to sc@localhost;
update mysql.user set password=old_password('sc') where user='sc';
flush privileges;
