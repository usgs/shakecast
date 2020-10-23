import win32serviceutil
import win32service
import win32event
import servicemanager
import socket
import logging
import os, sys
import traceback
import urllib2

from ..util import get_logging_dir, SC
from ...api import start as startweb

log_file = os.path.join(get_logging_dir(), 'sc-web-server.log')
logging.basicConfig(
    filename = log_file,
    level = logging.INFO, 
    format = '%(asctime)s: [ShakeCast - Web] %(levelname)-7.7s %(message)s'
)

class ShakecastWebServer (win32serviceutil.ServiceFramework):
    _svc_name_ = "sc_web_server"
    _svc_display_name_ = "ShakeCast Web Server"
    
    def __init__(self,args):
        win32serviceutil.ServiceFramework.__init__(self,args)
        self.stop_event = win32event.CreateEvent(None,0,0,None)
        socket.setdefaulttimeout(60)
        self.stop_requested = False

    def SvcStop(self):
        self.ReportServiceStatus(win32service.SERVICE_STOP_PENDING)
        win32event.SetEvent(self.stop_event)
        self.stop_requested = True

        sc = SC()
        web_port = sc.dict['web_port']

        # Send the http request to shutdown the server
        try:
            urllib2.urlopen('http://localhost:{}/shutdown'.format(web_port))
        except Exception:
            logging.error('Web server not running on {}'.format(web_port))

    def SvcDoRun(self):
        servicemanager.LogMsg(
            servicemanager.EVENTLOG_INFORMATION_TYPE,
            servicemanager.PYS_SERVICE_STARTED,
            (self._svc_name_,'')
        )
        self.main()

    @staticmethod
    def main():
        logging.info(' ** Starting ShakeCast Web Server ** ')
        try:
            startweb()

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
    argvals = ['web_server_service.py'] + command_in
    win32serviceutil.HandleCommandLine(ShakecastWebServer, argv=argvals)

if __name__ == '__main__':
    win32serviceutil.HandleCommandLine(ShakecastWebServer)
