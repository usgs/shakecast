setx /M PATH "%PATH%;C:\Python27;C:\Python27\Scripts;C:\Python27\Lib\site-packages\pywin32_system32;C:\Python27\Lib\site-packages\win32"

cd %USERPROFILE%\Shakecast\site-packages

C:\Python27\python.exe -m pip install --no-deps wheel-0.26.0-py2.py3-none-any.whl
C:\Python27\python.exe -m pip install --no-deps click-6.6-py2.py3-none-any.whl
C:\Python27\python.exe -m pip install --no-deps itsdangerous-0.24.tar.gz
C:\Python27\python.exe -m pip install --no-deps Jinja2-2.8-py2.py3-none-any.whl
C:\Python27\python.exe -m pip install --no-deps Werkzeug-0.11.10-py2.py3-none-any.whl
C:\Python27\python.exe -m pip install --no-deps MarkupSafe-0.23.tar.gz

C:\Python27\python.exe -m easy_install --no-deps Flask-0.10.1.tar.gz
C:\Python27\python.exe -m easy_install --no-deps Flask-Login-0.3.2.tar.gz
C:\Python27\python.exe -m easy_install --no-deps Flask-Uploads-0.2.0.tar.gz

C:\Python27\python.exe -m pip install --no-deps PySocks-1.5.7.tar.gz
C:\Python27\python.exe -m pip install --no-deps SQLAlchemy-1.0.14.tar.gz
C:\Python27\python.exe -m pip install --no-deps xmltodict-0.10.2.tar.gz

C:\Python27\python.exe -m pip install --no-deps pypiwin32-219-cp27-none-win32.whl