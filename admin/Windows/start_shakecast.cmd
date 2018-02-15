SET location=%~dp0

python "%location%server_service.py" --startup=auto install
python "%location%web_server_service.py" --startup=auto install

python "%location%server_service.py" start
python "%location%web_server_service.py" start

pause