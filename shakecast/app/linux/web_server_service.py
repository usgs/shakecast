import socket
from multiprocessing import Process
import os, sys
import traceback
import urllib2

from shakecast.app.util import SC, get_logging_dir
from shakecast.api import start as start_web_server


class ShakecastWebServer(object):
    _svc_name_ = "sc_web_server"
    _svc_display_name_ = "ShakeCast Web Server"
    
    def __init__(self):
        socket.setdefaulttimeout(60)

    @staticmethod
    def stop():
        # Send the http request to shutdown the server
        sc = SC()
        try:
            urllib2.urlopen('http://localhost:{}/shutdown'.format(sc.dict['web_port']))
        except Exception:
            # web server is not running
            pass
        
    def start(self):
        self.main()

    def start_daemon(self):
        p = Process(target=self.start)
        p.name = 'ShakeCast-Web-Server'
        p.daemon = True
        p.start()

    @staticmethod
    def main():
        start_web_server()

def invalid():
    print '''
    Invalid Command:
        start - Starts the ShakeCast Web Server
        stop - Stops the ShakeCast Web Server
    '''

if __name__ == '__main__':
    if len(sys.argv) > 1:
        if sys.argv[1] == "start":
            server = ShakecastWebServer()
            server.start()
        elif sys.argv[1] == "stop":
            server = ShakecastWebServer()
            server.stop()
        else:
            invalid()
    else:
        invalid()
