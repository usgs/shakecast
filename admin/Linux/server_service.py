import socket
import logging
import os, sys
import traceback

path = os.path.dirname(os.path.abspath(__file__))
path = path.split(os.sep)
del path[-1]
del path[-1]
path += ['sc']

app_dir = os.path.normpath(os.sep.join(path))
if app_dir not in sys.path:
    sys.path += [app_dir]

from app.server import Server
from ui import UI
from app.util import SC

path += ['logs', 'sc-service.log']
sc = SC()
if sc.dict['Logging']['level'] == 'info':
    log_level = logging.INFO
elif sc.dict['Logging']['level'] == 'debug':
    log_level = logging.DEBUG

logging.basicConfig(
    filename = os.path.normpath(os.sep.join(path)),
    level = log_level, 
    format = '%(asctime)s: [ShakeCast Server] %(levelname)-7.7s %(message)s')


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
        else:
            logging.info('Startup Failed -- ShakeCast Server is already started')

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

def invalid():
    print '''
    Invalid Command:
        start - Starts the ShakeCast Server
        stop - Stops the ShakeCast Server
    '''

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