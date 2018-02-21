echo off
SET location=%~dp0
cd %location%

cd ..\..\..\python\Python27

SET pythonLoc=%cd%

echo Stopping ShakeCast services...
"%pythonLoc%\python.exe" "%location%server_service.py" stop
"%pythonLoc%\python.exe" "%location%web_server_service.py" stop
echo done.

pause
