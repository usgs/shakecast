@echo off
set P="c:\program files\apache group\apache\bin\htpasswd"
set F="..\sc\userdbs\sc-users"

%P% -c -b %F% scadmin scadmin
