import socket
import logging
from multiprocessing import Process
import os, sys
import traceback
import urllib2

from shakecast.app.util import SC, get_logging_dir
from shakecast.web_server import start as start_web_server

logs_dir = get_logging_dir()
log_file = os.path.join(logs_dir, 'sc-web-server.log')
logging.basicConfig(
    filename = log_file,
    level = logging.INFO, 
    format = '%(asctime)s: [ShakeCast - Web] %(levelname)-7.7s %(message)s'
)


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

    def start_daemon(self):
        p = Process(target=self.start)
        p.name = 'ShakeCast-Web-Server'
        p.daemon = True
        p.start()

    @staticmethod
    def main():
        logging.info(' ** Starting ShakeCast Web Server ** ')
        try:
            start_web_server()

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
