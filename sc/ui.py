import socket
import time
from app.server import Server
from app.newthread import New_Thread

class UI(object):
    def __init__(self):
        self.stop_ui = False
        self.conn = socket.socket()
        
    def start(self):
        self.server_check()
        while self.stop_ui is False:
            user_in = raw_input('ShakeCast> ')
            sent = self.send(user_in)
            
            if sent is True:
                self.get_message()
                self.conn.close()
        
    def send(self, msg):
        sent = False
        while sent is False:
            try:
                if msg == 'shutdown':
                    to_server = "{'shutdown': {'func': self.shutdown}}"
                elif msg == 'info':
                    to_server = "{'info': {'func': self.info}}"
                elif msg == 'exit':
                    self.stop_ui = True
                    to_server = "{'ui_exit': {'func': self.ui_exit}}"
                elif 'stop_task' in msg:
                    msg = msg.split(' ')
                    to_server = "{'stop_task(%s)': {'func': self.stop_task, \
                                         'args_in': {'task_name': '%s'}}}" % (msg[1], msg[1])
                else:
                    to_server = msg
                    
                self.connect_to_server()    
                self.conn.send(to_server)
                self.conn.shutdown(1)
                sent = True
            except:
                sent = False
                if self.stop_ui is False:
                    print 'Failed to connect to server'
                    self.start_server()
                    
                    time.sleep(2)
                    print 'Resending message...'
                else:
                    print 'Closing UI...'
                    sent = True
            
        
        return sent

    def connect_to_server(self):
        self.conn = socket.socket()
        self.conn.connect(('', 1981))
        
    def get_message(self):
        data = ''
        part = None
        while part != '':
            part = self.conn.recv(4096)
            data += part
            
        print data
    
    def server_check(self):
        print 'Checking for server... ',
        try:
            self.connect_to_server()
            print 'connected'
        except:
            print 'None available.'
            self.start_server()
    
        
    def start_server(self):
        print 'Starting server...'
        try:
            sc_server = Server()
            sc_server.silent = True
            sc_server.ui_open = True
            server_thread = New_Thread(func=sc_server.loop)
            server_thread.start()
        except:
            print 'failed'
        
        
if __name__ == '__main__':
    ui = UI()
    ui.start()  
            
            