import os
import sys

from .server_service import ShakecastServer
from .web_server_service import ShakecastWebServer

from shakecast.app.env import LOG_DIRECTORY


def start():
    os.system(f'{sys.executable} -m shakecast.app.server &> {os.path.join(LOG_DIRECTORY, "sc-server.log")} &')
    os.system(f'{sys.executable} -m shakecast.api &> {os.path.join(LOG_DIRECTORY, "web-server.log")} &')

def stop():
    server = ShakecastServer()
    web_server = ShakecastWebServer()

    server.stop()
    web_server.stop()
