import os
import sys
import subprocess

from .server_service import ShakecastServer
from .web_server_service import ShakecastWebServer

from shakecast.app.env import LOG_DIRECTORY, SHAKECAST_DIRECTORY


def start():
    web_log = os.path.join(LOG_DIRECTORY, 'web-server.log')
    server_log = os.path.join(LOG_DIRECTORY, 'sc-server.log')

    os.system(f'{sys.executable} -m shakecast.api &> {web_log} &')
    os.system(f'{sys.executable} -um shakecast.app.server > {server_log} &')

def stop():
    server = ShakecastServer()
    web_server = ShakecastWebServer()

    server.stop()
    web_server.stop()
