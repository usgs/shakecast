
from server_service import ShakecastServer
from web_server_service import ShakecastWebServer

def start():
    server = ShakecastServer()
    web_server = ShakecastWebServer()

    server.start_daemon()
    web_server.start_daemon()

def stop():
    server = ShakecastServer()
    web_server = ShakecastWebServer()

    server.stop()
    web_server.stop()
