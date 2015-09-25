import threading
import time

class New_Thread(threading.Thread):
    
    def __init__(self, func, args_in=None, loop=False, loop_time=5):
        super(New_Thread, self).__init__()
        self._stop = threading.Event()
        #self.name = str(func).split(" ")[1].strip()
        self.func = func
        #self.sleep = sleep
        self.args_in = args_in
        self.loop = loop
        self.loop_time = loop_time
        
    def stop(self):
        
        self._stop.set()
        
    def stopped(self):
        self._stop.isSet()
        
    def run(self):
        if self.func is not None:
            if self.loop is False:
                if self.args_in is not None:
                    self.func(**self.args_in)
                else:
                    self.func()
            else:
                while not self._stop.isSet():
                    if self.args is not None:
                        self.func(**self.args_in)
                    else:
                        self.func()
                    
                    time.sleep(self.loop_time)