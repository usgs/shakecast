echo off
SET location=%~dp0
cd %location%

cd ..\..\..\python\Python27

SET pythonLoc=%cd%

echo Uninstalling ShakeCast services...
"%pythonLoc%\python.exe" "%location%server_service.py" remove
"%pythonLoc%\python.exe" "%location%web_server_service.py" remove
echo done.


cd %location%

pause