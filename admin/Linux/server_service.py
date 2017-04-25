import socket
import logging
import os, sys
import traceback
from multiprocessing import Process

path = os.path.dirname(os.path.abspath(__file__))
path = path.split(os.sep)
del path[-1]
del path[-1]
path += ['sc']

app_dir = os.path.normpath(os.sep.join(path))
if app_dir not in sys.path:
    sys.path += [app_dir]

path += ['logs', 'sc-service.log']
logging.basicConfig(
    filename = os.path.normpath(os.sep.join(path)),
    level = logging.DEBUG, 
    format = '[ShakeCast] %(levelname)-7.7s %(message)s'
)

from app.server import Server
from ui import UI

class ShakecastServer(object):
    _svc_name_ = "sc_server"
    _svc_display_name_ = "ShakeCast Server"
    
    def __init__(self):
        socket.setdefaulttimeout(60)

    def stop(self):
        ui = UI()
        ui.send('shutdown')

    def start(self):
        server = Process(target=self.main)
        server.start()

    @staticmethod
    def main():
        logging.info(' ** Starting ShakeCast Server ** ')
        try:
            sc_server = Server()

            # start shakecast
            sc_server.start_shakecast()
            
            while sc_server.stop_server is False:
                sc_server.stop_loop = False
                sc_server.loop()

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
