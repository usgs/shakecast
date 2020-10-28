import os
import sys

from server_service import ShakecastServer
from web_server_service import ShakecastWebServer

def start():
    os.system('{} -m shakecast.api &'.format(sys.executable))
    os.system('{} -m shakecast.app.server &'.format(sys.executable))

def stop():
    server = ShakecastServer()
    web_server = ShakecastWebServer()

    server.stop()
    web_server.stop()
