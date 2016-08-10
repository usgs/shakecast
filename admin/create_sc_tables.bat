@echo off

echo Creating ShakeCast Tables...

set MYSQL="c:\program files\mysql\mysql server 5.0\bin\mysql"

%MYSQL% -u sc -psc sc <..\sc\db\sc-create.sql

echo Done.



