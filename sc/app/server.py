import socket
import select
import time
import os
import sys
from newthread import New_Thread
from task import Task
from functions import *

class Server(object):
    def __init__(self):
        self.stop_loop = False
        self.stop_server = False
        self.socket = socket.socket()
        self.port = 1981
        self.sleep = .2
        self.connections = {}
        self.queue = []
        self.print_out = ''
        self.silent = False
        self.ui_open = False
        self.last_task = 0
        
        self.socket_setup()
        
    def socket_setup(self):
        self.make_print('Setting up socket...')
        connected = False
        attempts = 0
        while connected is False and attempts < 60:
            try:
                self.make_print('connecting... ')
                self.socket.bind(('', self.port))
                self.socket.listen(5)
                self.make_print('success')
                connected = True
                
            except:
                self.make_print('failed')
                time.sleep(2)
                
            attempts += 1
    
    def loop(self):
        self.last_task = time.time()
        while self.stop_loop is not True:
            self.socket_check()
            self.queue_check()
            self.cleanup()
            
            if self.silent is not True:
                self.talk()
            
            time.sleep(self.sleep)
        
        # cleanly shut down the server    
        self.queue_check()
        self.cleanup()
        self.socket.close()
    
    def socket_check(self):
        # check if any connects have been established
        conns = select.select([self.socket], [], [], 0)[0]
        if len(conns) > 0:
            conn, addr = self.socket.accept()
            conn.setblocking(0)
            
            client_thread = New_Thread(func=self.handle_client,
                                       args_in={'conn': conn, 'addr': addr})
            client_thread.start()
            
    def handle_client(self, conn=None, addr=None):
        # check for message
        mess_check = select.select([conn], [], [], 60)[0]
        # get message from user
        if len(mess_check) > 0:
            data = ''
            part = None
            while part != "" and mess_check != []:
                part = conn.recv(4096)
                data += part
                
                mess_check = select.select([conn], [], [], 0)[0]
            
            #print 'Got Data: %s' % data
            self.user_in(data, conn)
    
    def user_in(self, data=None, conn=None):
        try:
            new_task_dict = eval(data)
            good_data = True
        except:
            conn.send('Bad Command: %s' % data)
            good_data = False
            
        if good_data is True:    
            for key, value in new_task_dict.iteritems():
                task_id = int(time.time() * 1000000)
                new_task = Task(name=key, task_id=task_id, **value)
                
                if new_task.loop is True:
                    conn.send('Received looping task. Closing connection...')
                    conn.close()
                else:
                    self.connections[task_id] = conn
                
                self.queue += [new_task]
                
                self.log('Task added to queue: %s' % new_task.name)
    
    def queue_check(self):
        timestamp = time.time()
        for task in self.queue:
            # run tasks if it's their time and they aren't already running
            if task.next_run < timestamp and task.status == 'stopped':
                self.make_print('Running: %s' % task.name)
                self.last_task = time.time()
                
                task_thread = New_Thread(func=task.run)
                task_thread.start()
            
            elif task.status == 'finished' or task.status == 'failed':
                self.check_task(task=task)
            
    def check_task(self, task=Task()):
        
        if task.loop is False:
            out_str = ''
            if task.output['status'] == 'finished':
                out_str = task.output['message']
            elif task.status == 'failed':
                out_str = '%s failed to run...' % task.name
            
            conn = self.connections[task.id]    
            conn.send(out_str)
            conn.close()
            task.status = 'complete'

        else:
            task.status = 'stopped'
            
    def cleanup(self):
        new_conns = {}
        new_queue = []
        for task in self.queue:
            if task.status != 'complete':
                try:
                    new_conns[task.id] = self.connections[task.id]
                except:
                    pass
                
                new_queue += [task]
                
        self.connections = new_conns
        self.queue = new_queue
        
    def info(self):
        # send info back to the UI about what the server is doing
        return {'status': 'finished',
                'message': "{'queue': %s, \
                              'connections': %s}" % (self.queue,
                                                    self.connections)}
    
    def talk(self):
        # send print statements to terminal or log
            
        # print information to the terminal... we'll change change
        # this to print to a log most likely...
        os.system('cls' if os.name == 'nt' else 'clear')
        print 'ShakeCast Server \n'
        print 'Looping: %s' % time.time()
        #print 'QUEUE: %s' % [str(task) for task in self.queue]
        print 'QUEUE: %s' % self.queue
        print 'Connections: %s' % self.connections
        print '\n%s' % self.print_out
        
    def make_print(self, add_str):
        if len(self.print_out.splitlines()) < 15:
            self.print_out += '\n' + add_str
        else:
            self.print_out = '\n' + add_str
        
    def log(self, to_print):
        # log the server's output in a specific location
        #print to_print
        # handle request
        # return feedback
        pass
    
    def stop_task(self, task_name=None):
        new_queue = []
        task_stopped = 'None'
        for task in self.queue:
            if task.name != task_name:
                new_queue += [task]
            else:
                task_stopped = task.name
        
        self.make_print('Stopped %s...' % task_stopped)
        self.queue = new_queue
        return {'status': 'finished',
                'message': 'Stopped %s...' % task_stopped}
    
    def check_conn(self):
        if (time.time() - self.last_task > 600 and
                self.ui_open is False):
            self.shutdown()
            
    def ui_exit(self):
        if self.ui_open is True:
            self.shutdown()
            msg = "Stopping server..."
        else:
            msg = "Bye!"
            
        return {'status': 'finished',
                'message': msg}
    
    def stop(self):
        self.stop_loop = True
        return {'status': 'finished',
                'message': 'Stopping loop...'}
    
    def shutdown(self):
        # we should do something here if there are non-looping tasks in
        # the queue
        self.stop_server = True
        self.stop()
        self.make_print('Shutting down server...')
        return {'status': 'finished',
                'message': 'Stopping server...'}
            
if __name__ == '__main__':
    sc_server = Server()
    while sc_server.stop_server is False:
        sc_server.loop()
    
