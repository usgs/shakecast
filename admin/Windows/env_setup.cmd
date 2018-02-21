echo off
SET location=%~dp0
cd %location%

cd ..\..\..\python\Python27

SET pythonLoc=%cd%

:: only add new paths if they aren't already in PATH
SET newPath=%pythonLoc%;%pythonLoc%\Scripts;%pythonLoc%\Lib\site-packages\pywin32_system32;%pythonLoc%\Lib\site-packages\win32
(echo ";%PATH%;" | find /C /I ";%newPath%;")>tmp.txt

SET /P var=<tmp.txt

IF "%var%"=="0" (
	echo Add new directories to path:
	echo "%newPath%"
	setx /M PATH "%PATH%;%newPath%"
) ELSE (
	echo No path updates required.
)

del tmp.txt

echo Installing required libraries...

cd ..\..\site-packages

"%pythonLoc%\python.exe" -m pip install --no-deps wheel-0.26.0-py2.py3-none-any.whl
"%pythonLoc%\python.exe" -m pip install --no-deps click-6.6-py2.py3-none-any.whl
"%pythonLoc%\python.exe" -m pip install --no-deps itsdangerous-0.24.tar.gz
"%pythonLoc%\python.exe" -m pip install --no-deps Jinja2-2.8-py2.py3-none-any.whl
"%pythonLoc%\python.exe" -m pip install --no-deps Werkzeug-0.11.10-py2.py3-none-any.whl
"%pythonLoc%\python.exe" -m pip install --no-deps MarkupSafe-0.23.tar.gz

"%pythonLoc%\python.exe" -m easy_install --no-deps Flask-0.10.1.tar.gz
"%pythonLoc%\python.exe" -m easy_install --no-deps Flask-Login-0.3.2.tar.gz
"%pythonLoc%\python.exe" -m easy_install --no-deps Flask-Uploads-0.2.0.tar.gz

"%pythonLoc%\python.exe" -m pip install --no-deps PySocks-1.5.7.tar.gz
"%pythonLoc%\python.exe" -m pip install --no-deps SQLAlchemy-1.0.14.tar.gz
"%pythonLoc%\python.exe" -m pip install --no-deps xmltodict-0.10.2.tar.gz

"%pythonLoc%\python.exe" -m pip install --no-deps pypiwin32-219-cp27-none-win32.whl

cd %location%

pause