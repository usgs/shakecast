import socket
import time
import select
import sys
from app.server import Server
from app.newthread import New_Thread

class UI(object):
    """
    A command line interface to interact with the ShakeCast server.
    
    Commands:
    info        Usage: info
                    Gets information from the server about the Tasks it's
                    currently running
                    
    stop_task   Usage: stop_task <task_name>
                    Sets the specified Task status to 'Finished' to
                    remove it from the Server's queue
                    
    exit        Usage: exit
                    Exits the CLI; this will not shutdown the Server unless
                    the Server was started within the UI
    
    shutdown    Usage: shutdown
                    Shuts the server down allowing running tasks to finish
    """
    def __init__(self):
        self.stop_ui = False
        self.conn = socket.socket()
        self.conns = {}
        self._get_message = True
        self.print_queue = []
        
    def start(self):
        """
        Starts the CLI loop
        """
        self.server_check()
        
        message_thread = New_Thread(self.get_message_loop)
        message_thread.start()
        
        print "ShakeCast> ",
        sys.stdout.flush()
        user_in = None
        while self.stop_ui is not True:
            if self.stop_ui is not False:
                self.stop_ui = True
                
            user_in = self.get_input()
            if user_in is not None:
                sent = self.send(user_in)
                print "\nShakeCast> ",
                sys.stdout.flush()
            time.sleep(.1)
        
    def get_input(self):
        """
        Checks for input from the user and determines when to send
        input to the server
        """
        try:
            input_check = select.select([sys.stdin], [], [], 0)[0]
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
        
        sent = False
        while sent is False:
            try:
                if msg == 'shutdown':
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
                else:
                    to_server = msg
                    
                self.connect_to_server()    
                self.conn.send(to_server)
                self.conn.shutdown(1)
                
                self.conns += [self.conn]
                
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
                    
                    # The server is down, so close messaging down
                    # without an exit message
                    self._get_message = False
                    sent = True
            
        
        return sent

    def connect_to_server(self):
        """
        Attempt to connect to the server
        """
        self.conn = socket.socket()
        self.conn.connect(('', 1981))
        
    def get_message(self):
        """
        Receive a message from the server
        """
        data = ''
        part = None
        while part != '':
            part = self.conn.recv(4096)
            data += part
            
        print data
        
    def get_message_loop(self):
        """
        Build and print a message from the Server
        """
        while self._get_message is not False:
            new_conns = []
            for conn in self.conns:
            
                try:
                    mess = select.select([conn], [], [], 0)[0]
                except:
                    mess = []
                if len(mess) > 0:
            
                    data = ''
                    part = None
                    while part != '':
                        part = conn.recv(4096)
                        data += part
                    
                    print '\n%s' % data
                        
                    if self._get_message is not True:
                        self._get_message = False
                    else:
                        print 'ShakeCast> ',
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
        print 'Checking for server... ',
        try:
            self.connect_to_server()
            print 'connected'
        except:
            print 'None available.'
            self.start_server()
    
        
    def start_server(self):
        """
        Starts a Server if there isn't one running
        """
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
            
            