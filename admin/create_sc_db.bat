@echo off

echo Creating ShakeCast database schema...

set MYSQL="c:\program files\mysql\mysql server 5.0\bin\mysql"

%MYSQL% -u root -p%1 <create_sc_db.sql

echo Done.



