setx /M PATH "%PATH%;C:\Python27;C:\Python27\Scripts;C:\Python27\Lib\site-packages\pywin32_system32;C:\Python27\Lib\site-packages\win32"

cd %USERPROFILE%\Shakecast
C:\Python27\python.exe -m pip install -r requirements.txt
C:\Python27\python.exe -m pip install pypiwin32

pause