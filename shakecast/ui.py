import socket
import time
import select as select_
import sys

from .app.server import Server
from .app.newthread import NewThread

import shakecast.app.env as env

class UI(object):
    """
    A command line interface to interact with the ShakeCast server.
    
    Commands:
        info
            Gets information from the server about the Tasks it's
            currently running
                        
        stop_task <task_name>
            Sets the specified Task status to 'Finished' to
            remove it from the Server's queue
                        
        exit
            Exits the CLI; this will not shutdown the Server unless
            the Server was started within the UI
        
        shutdown
            Shuts the server down allowing running tasks to finish
    """
    def __init__(self):
        self.stop_ui = False
        self.conn = socket.socket()
        self.conns = []
        self._get_message = True
        self.print_queue = []

        self.port = env.SERVER_PORT
        self.host = env.SERVER_HOST_NAME

    def start(self):
        """
        Starts the CLI loop
        """
        self.server_check()
        
        message_thread = NewThread(self.get_message_loop)
        message_thread.start()
        
        print("ShakeCast> ", end=' ')
        sys.stdout.flush()
        user_in = None
        while self.stop_ui is not True:
            if self.stop_ui is not False:
                self.stop_ui = True
                
            user_in = self.get_input()
            if user_in is not None:
                sent = self.send(user_in)
                print("\nShakeCast> ", end=' ')
                sys.stdout.flush()
            time.sleep(.1)
        
    def get_input(self):
        """
        Checks for input from the user and determines when to send
        input to the server
        """
        try:
            input_check = select_.select([sys.stdin], [], [], 0)[0]
        except:
            input_check = []
            
        if len(input_check) > 0:
            user_in = sys.stdin.readline()
            if '\n' in user_in:
                return_str = user_in.strip('\n')
            else:
                return_str = None
        else:
            return_str = None
            
        return return_str
    
        
    def send(self, msg):
        """
        Sends an input message to the Server. This is where the
        hard-wired commands are translated into the Server API
        """
        try:
            
            #######################################################
            ################### API Translation ###################
            
            if msg == 'shutdown' and self.port != 80 and self.port != 5000:
                to_server = "{'shutdown': {'func': self.shutdown}}"
            elif msg == 'info':
                to_server = "{'info': {'func': self.info}}"
            elif msg == 'exit':
                self._get_message = 'last'
                self.stop_ui = 'last'
                to_server = "{'ui_exit': {'func': self.ui_exit}}"
            elif 'stop_task' in msg:
                msg = msg.split(' ')
                to_server = "{'stop_task(%s)': \
                                    {'func': self.stop_task, \
                                        'args_in': {'task_name': '%s'}}}" % (msg[1],
                                                                            msg[1])
            elif msg == 'start':
                to_server = "{'start_shakecast': {'func': self.start_shakecast}}"
            elif msg == 'stop':
                to_server = "{'stop_shakecast': {'func': self.stop_shakecast}}"
            else:
                to_server = msg
                
            self.connect_to_server()    
            self.conn.send(to_server.encode())
            
            self.conns += [self.conn]
            
            sent = True
        except Exception:
            sent = False

        return sent

    def connect_to_server(self):
        """
        Attempt to connect to the server
        """
        self.conn = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.conn.settimeout(3)
        self.conn.connect((self.host, self.port))
        
    def get_message(self):
        """
        Receive a message from the server
        """
        messages = []
        closed_conns = []

        for conn in self.conns:
            ready = select_.select([conn], [], [], .2)
            if ready[0]:
                message = ''
                part = None
                while part != '':
                    part = conn.recv(4096)
                    message += part

                
                conn.shutdown(1)
                conn.close()
                closed_conns += [conn]
                messages += [self.parse_message(message)]
                print(message)
        
        # close finished connections
        self.conns = [conn for conn in self.conns
                                if conn not in closed_conns]
        return messages

    @staticmethod
    def parse_message(message):
        try:
            parse_message = eval(message)
        except Exception:
            parse_message = message
        
        return parse_message
        
    def get_message_loop(self):
        """
        Build and print a message from the Server
        """
        while self._get_message is not False:
            new_conns = []
            for conn in self.conns:
            
                try:
                    mess = select_.select([conn], [], [], 0)[0]
                except:
                    mess = []
                if len(mess) > 0:
            
                    data = ''
                    part = None
                    while part != '':
                        part = conn.recv(4096)
                        data += part
                    
                    print('\n%s' % data)
                        
                    if self._get_message is not True:
                        self._get_message = False
                    else:
                        print('ShakeCast> ', end=' ')
                        sys.stdout.flush()
                    
                    conn.close()
                    
                    
                else:
                    new_conns += [conn]
                
            self.conns = new_conns
                    
            time.sleep(.1)
    
    def server_check(self):
        """
        Check our connection to the Server
        """
        #print 'Checking for server... ',
        try:
            self.connect_to_server()
            return True
        except:
            return False

        
        
if __name__ == '__main__':
    ui = UI()
    ui.start()  
            
            
