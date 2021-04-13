import socket
import logging
from multiprocessing import Process
import os, sys
import traceback

from shakecast.app.server import Server
from shakecast.app.util import SC
from shakecast.ui import UI

class ShakecastServer(object):
    _svc_name_ = "sc_server"
    _svc_display_name_ = "ShakeCast Server"
    
    def __init__(self):
        socket.setdefaulttimeout(60)

    @staticmethod
    def stop():
        ui = UI()
        ui.send('shutdown')

    def start(self):
        ui = UI()
        if ui.server_check() is False:
            self.main()

    def start_daemon(self):
        p = Process(target=self.start)
        p.name = 'ShakeCast-Server'
        p.daemon = True
        p.start()

    @staticmethod
    def main():
        sc_server = Server()

        # start shakecast
        sc_server.start_shakecast()
        
        while sc_server.stop_server is False:
            sc_server.stop_loop = False
            sc_server.loop()


def invalid():
    print('''
    Invalid Command:
        start - Starts the ShakeCast Server
        stop - Stops the ShakeCast Server
    ''')

if __name__ == '__main__':
    if len(sys.argv) > 1:
        if sys.argv[1] == "start":
            server = ShakecastServer()
            server.start()
        elif sys.argv[1] == "stop":
            server = ShakecastServer()
            server.stop()
        else:
            invalid()
    else:
        invalid()