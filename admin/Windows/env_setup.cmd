setx /M PATH "%PATH%;C:\Python27;C:\Python27\Scripts;C:\Python27\Lib\site-packages\pywin32_system32;C:\Python27\Lib\site-packages\win32"

C:\Python27\python.exe -m easy_install Flask==0.10.1
C:\Python27\python.exe -m easy_install Flask-Login==0.3.2
C:\Python27\python.exe -m easy_install Flask-Uploads==0.2.0

cd %USERPROFILE%\Shakecast
C:\Python27\python.exe -m pip install -r requirements.txt
C:\Python27\python.exe -m pip install pypiwin32

pause