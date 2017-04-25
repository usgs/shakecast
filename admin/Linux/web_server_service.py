import socket
import logging
import os, sys
import traceback
import time
from multiprocessing import Process

path = os.path.dirname(os.path.abspath(__file__))
path = path.split(os.sep)
del path[-1]
del path[-1]
path += ['sc']

app_dir = os.path.normpath(os.sep.join(path))
if app_dir not in sys.path:
    sys.path += [app_dir]

path += ['logs', 'sc-web-server.log']
logging.basicConfig(
    filename = os.path.normpath(os.sep.join(path)),
    level = logging.DEBUG, 
    format = '[ShakeCast - Web] %(levelname)-7.7s %(message)s'
)

from web_server import app

class ShakecastWebServer(object):
    _svc_name_ = "sc_web_server"
    _svc_display_name_ = "ShakeCast Web Server"
    
    def __init__(self):
        socket.setdefaulttimeout(60)

    def stop(self):
        # Send the http request to shutdown the server
        try:
            urllib2.urlopen('http://localhost:80/shutdown')
        except Exception:
            urllib2.urlopen('http://localhost:5000/shutdown')

    def start(self):
        p = Process(target=self.main)
        p.daemon = True
        p.start()
        #time.sleep(3)

    @staticmethod
    def main():
        logging.info(' ** Starting ShakeCast Web Server ** ')
        try:
            app.run(host='0.0.0.0', port=80, processes=3)

        except Exception as e:
            exc_tb = sys.exc_info()[2]
            filename, line_num, func_name, text = traceback.extract_tb(exc_tb)[-1]
            logging.info('{}: {} - line: {}\nOriginated: {} {} {} {}'.format(type(e), 
                                                                             e, 
                                                                             exc_tb.tb_lineno,
                                                                             filename, 
                                                                             line_num, 
                                                                             func_name, 
                                                                             text))
        return

if __name__ == '__main__':
    server = ShakecastWebServer()
    server.start()