echo off
SET location=%~dp0
cd %location%

SET pythonLoc="C:\Python27"

:: only add new paths if they aren't already in PATH
SET newPath=C:\Python27;C:\Python27\Scripts;C:\Python27\Lib\site-packages\pywin32_system32;C:\Python27\Lib\site-packages\win32
(echo ";%PATH%;" | find /C /I ";%newPath%;")>tmp.txt

SET /P var=<tmp.txt

IF "%var%"=="0" (
	echo Add new directories to path:
	echo "%newPath%"
	setx /M PATH "%newPath%;%PATH%"
) ELSE (
	echo No path updates required.
)

del tmp.txt

echo Installing required libraries...

cd ..\..\

"%pythonLoc%\python.exe" -m pip install --no-deps pypiwin32-219-cp27-none-win32.whl
"%pythonLoc%\python.exe" -m pip install usgs-shakecast

cd %location%

pause