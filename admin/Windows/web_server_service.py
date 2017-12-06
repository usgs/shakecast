import win32serviceutil
import win32service
import win32event
import servicemanager
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

class ShakecastServer (win32serviceutil.ServiceFramework):
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

        # Send the http request to shutdown the server
        try:
            urllib2.urlopen('http://localhost:80/shutdown')
        except Exception:
            urllib2.urlopen('http://localhost:5000/shutdown')

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
            start()

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
    win32serviceutil.HandleCommandLine(ShakecastServer)
