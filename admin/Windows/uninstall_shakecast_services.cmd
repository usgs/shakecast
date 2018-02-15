SET location=%~dp0

python "%location%server_service.py" remove
python "%location%web_server_service.py" remove

pause