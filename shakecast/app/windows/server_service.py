import win32serviceutil
import win32service
import win32event
import servicemanager
import socket
import logging
import os, sys
import traceback

from ..server import Server
from ...ui import UI
from ..util import get_logging_dir, SC

sc = SC()
if sc.dict['Logging']['level'] == 'info':
    log_level = logging.INFO
elif sc.dict['Logging']['level'] == 'debug':
    log_level = logging.DEBUG

log_file = os.path.join(get_logging_dir(), 'sc-service.log')
logging.basicConfig(
    filename = log_file,
    level = log_level, 
    format = '%(asctime)s: [ShakeCast Server] %(levelname)-7.7s %(message)s')

class ShakecastServer(win32serviceutil.ServiceFramework):
    _svc_name_ = "sc_server"
    _svc_display_name_ = "ShakeCast Server"
    
    def __init__(self,args):
        win32serviceutil.ServiceFramework.__init__(self,args)
        self.stop_event = win32event.CreateEvent(None,0,0,None)
        socket.setdefaulttimeout(60)
        self.stop_requested = False

    def SvcStop(self):
        self.ReportServiceStatus(win32service.SERVICE_STOP_PENDING)
        win32event.SetEvent(self.stop_event)
        logging.info('Stopping ShakeCast Server...')
        self.stop_requested = True

        ui = UI()
        ui.send('shutdown')

    def SvcDoRun(self):
        servicemanager.LogMsg(
            servicemanager.EVENTLOG_INFORMATION_TYPE,
            servicemanager.PYS_SERVICE_STARTED,
            (self._svc_name_,'')
        )
        self.main()

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

def command(command_in):
    argvals = ['server_service.py'] + command_in
    win32serviceutil.HandleCommandLine(ShakecastServer, argv=argvals)

if __name__ == '__main__':
    win32serviceutil.HandleCommandLine(ShakecastServer)
