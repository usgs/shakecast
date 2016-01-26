import socket
import select as select_
import time
import os
import sys
from newthread import New_Thread
from task import Task
from functions import *
from functions_util import *

class Server(object):
    
    """
    The ShakeCast server is essentially the "conductor" of the system.
    It keeps track of which functions (tasks) are supposed to run and
    when. It also provides API that can be used for the UI to ask
    specific tasks to be run with specific inputs
    """
    
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
        self.db_open = True
        
        self.log_file = '%s%s%s%s' % (sc_dir(),
                                    'logs',
                                    get_delim(),
                                    'server.log')
        self.sc_log_file = '%s%s%s%s' % (sc_dir(),
                                         'logs',
                                         get_delim(),
                                         'shakecast.log')
        
        self.socket_setup()
        
    def socket_setup(self):
        # connects the server to a specific socket
        
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
        # start the server loop
        
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
        # check if any connections have been established
        conns = select_.select([self.socket], [], [], 0)[0]
        if len(conns) > 0:
            conn, addr = self.socket.accept()
            conn.setblocking(0)
            
            client_thread = New_Thread(func=self.handle_client,
                                       args_in={'conn': conn, 'addr': addr})
            client_thread.start()
            
    def handle_client(self, conn=None, addr=None):
        # check for message
        mess_check = select_.select([conn], [], [], 60)[0]
        # get message from user
        if len(mess_check) > 0:
            data = ''
            part = None
            while part != "" and mess_check != []:
                part = conn.recv(4096)
                data += part
                
                mess_check = select_.select([conn], [], [], 0)[0]
            
            #print 'Got Data: %s' % data
            self.user_in(data, conn)
    
    def user_in(self, data=None, conn=None):
        # Get command from user input through socket
        
        try:
            new_task_dict = eval(data)
            good_data = True
        except:
            conn.send('Bad Command: %s' % data)
            good_data = False
            
        if good_data is True:    
            for key, value in new_task_dict.iteritems():
                task_id = int(time.time() * 1000000)
                try:
                    db_use = value.pop('db_use')
                except:
                    db_use = False
                    
                new_task = Task(name=key, task_id=task_id, db_use=db_use, **value)
                
                if new_task.loop is True:
                    conn.send('Received looping task. Closing connection...')
                    conn.close()
                else:
                    self.connections[task_id] = conn
                
                self.queue += [new_task]
                
                self.log(message='Task added to queue: %s' % new_task.name,
                         which='server')
    
    def queue_check(self):
        # Check for tasks that are ready to be run
        # and finished tasks that can be removed
        timestamp = time.time()
        for i,task in enumerate(self.queue):
            # run tasks if it's their time and they aren't already running
            if ((task.next_run < timestamp and task.status == 'stopped') and
                (task.db_use is False or self.db_open is True)):
                    
                    if task.db_use is True:
                        self.db_open = False
                    
                    self.make_print('Running: %s' % task.name)
                    self.last_task = time.time()
                    
                    task_thread = New_Thread(func=task.run)
                    task_thread.start()
                    
                    # move task to the end of the list
                    self.queue.pop(i)
                    self.queue += [task]
                    
            elif task.status == 'finished' or task.status == 'failed':
                self.check_task(task=task)
            
    def check_task(self, task=Task()):
        # Check the output from a finished task
        
        if task.loop is False:
            out_str = ''
            server_log = ''
            if task.output['status'] == 'finished':
                out_str = task.output['message']
                server_log = 'Task: %s :: finished'
            elif task.output['status'] == 'failed':
                out_str = "FAILED: %s" % task.output['message']
                server_log = 'Task: %s :: failed to finish'
            elif task.status == 'failed':
                out_str = '%s failed to run...' % task.name
                server_log = 'Task: %s :: failed to run'
                
            self.log(message=task.output.get('log', ''),
                     which='shakecast')
            self.log(message=task.output.get('log', ''),
                     which='server')
            
            conn = self.connections[task.id]    
            conn.send(out_str)
            conn.close()
            task.status = 'complete'

        else:
            task.status = 'stopped'
            
        if task.db_use is True:
            self.db_open = True
            
    def cleanup(self):
        # Remove tasks that have completed their work and the
        # connections associated with them
        
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
        # This should be updated to be __str__
            
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
        # Add a new string onto the output string from the server
        # it loops at 15 lines for the print statement
        
        if len(self.print_out.splitlines()) < 15:
            self.print_out += '\n' + add_str
        else:
            self.print_out = '\n' + add_str
        
    def log(self, message='', which=''):
        if which == 'shakecast':
            log_file = self.sc_log_file
        else:
            log_file = self.log_file
            
        date_time = time.strftime('%c')    
            
        with open(log_file, 'a') as file_:
            file_.write('%s%s%s\n' % (date_time, ':: ', message))
    
    def stop_task(self, task_name=None):
        # Sets a looping task's status to 'Finished'
        
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
        # check if the server should still be running. If it was not
        # started by opening the UI, and hasn't run a task in 10 minutes
        # shut it down
        
        if (time.time() - self.last_task > 600 and
                self.ui_open is False):
            self.shutdown()
            
    def ui_exit(self):
        # Determine if the server should shutdown when the UI exits
        
        if self.ui_open is True:
            self.shutdown()
            msg = "Stopping server..."
        else:
            msg = "Bye!"
            
        return {'status': 'finished',
                'message': msg}
    
    def stop(self):
        # Stop server loop. It will be restarted immediately
        self.stop_loop = True
        return {'status': 'finished',
                'message': 'Stopping loop...'}
    
    def shutdown(self):
        # Stops the server
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
        sc_server.stop_loop = False
        sc_server.loop()
    
