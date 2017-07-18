python "%userprofile%\Shakecast\admin\Windows\server_service.py" stop
python "%userprofile%\Shakecast\admin\Windows\web_server_service.py" stop

python "%userprofile%\Shakecast\admin\Windows\server_service.py" remove
python "%userprofile%\Shakecast\admin\Windows\web_server_service.py" remove

python "%userprofile%\Shakecast\admin\Windows\server_service.py" install
python "%userprofile%\Shakecast\admin\Windows\web_server_service.py" install

python "%userprofile%\Shakecast\admin\Windows\server_service.py" start
python "%userprofile%\Shakecast\admin\Windows\web_server_service.py" start