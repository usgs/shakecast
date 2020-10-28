import os

from server_service import ShakecastServer
from web_server_service import ShakecastWebServer

def start():
    os.system('python -m shakecast.api &')
    os.system('python -m shakecast.app.server &')

def stop():
    server = ShakecastServer()
    web_server = ShakecastWebServer()

    server.stop()
    web_server.stop()
