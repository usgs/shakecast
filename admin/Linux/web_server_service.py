import socket
import logging
import os, sys
import traceback
import urllib2
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
    level = logging.INFO, 
    format = '%(asctime)s: [ShakeCast - Web] %(levelname)-7.7s %(message)s'
)

from web_server import start
from app.util import SC

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
            logging.info('Stopping web server...')
            urllib2.urlopen('http://localhost:{}/shutdown'.format(sc.dict['web_port']))
            logging.info('Done.')
        except Exception:
            logging.info('Web server is not running.')
        
    def start(self):
        self.main()

    @staticmethod
    def main():
        logging.info(' ** Starting ShakeCast Web Server ** ')
        try:
            start()

        except Exception as e:
            logging.info('FAILED')
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
