echo off
SET location=%~dp0
cd %location%

cd ..\..\..\python/Python27
SET pythonLoc=%cd%

echo Installing ShakeCast services...
"%pythonLoc%\python.exe" "%location%server_service.py" --startup=auto install
"%pythonLoc%\python.exe" "%location%web_server_service.py" --startup=auto install
echo done.

echo Starting ShakeCast services...
"%pythonLoc%\python.exe" "%location%server_service.py" start
"%pythonLoc%\python.exe" "%location%web_server_service.py" start
echo done.

pause