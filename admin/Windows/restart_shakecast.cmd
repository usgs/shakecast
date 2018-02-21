echo off
SET location=%~dp0
cd %location%

cd ..\..\..\python\Python27

SET pythonLoc=%cd%

echo Stopping ShakeCast services...
"%pythonLoc%\python.exe" "%location%server_service.py" stop
"%pythonLoc%\python.exe" "%location%web_server_service.py" stop
echo done.

echo Uninsalling ShakeCast services...
"%pythonLoc%\python.exe" "%location%server_service.py" remove
"%pythonLoc%\python.exe" "%location%web_server_service.py" remove
timeout 5
echo done.

echo Reinstalling services...
"%pythonLoc%\python.exe" "%location%server_service.py" install
"%pythonLoc%\python.exe" "%location%web_server_service.py" install
echo done.

echo Restarting ShakeCast...
"%pythonLoc%\python.exe" "%location%server_service.py" start
"%pythonLoc%\python.exe" "%location%web_server_service.py" start
echo done.

pause