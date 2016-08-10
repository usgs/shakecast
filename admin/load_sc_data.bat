@echo off

echo Loading ShakeCast Data...

set MYSQL="c:\program files\mysql\mysql server 5.0\bin\mysql"

%MYSQL% -u sc -psc sc <..\sc\db\sc-data.sql

echo Done.
