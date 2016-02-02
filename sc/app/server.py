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
    It keeps track of which functions (Tasks) are supposed to run and
    when. It provides an API that can be utilized through the CLI
    and eventually the GUI.
    
    API: {'name_of_task': {'func': name_of_function,
                           'loop': True/False,
                           'interval': int (duration between looping runs),
                           'args_in': kwargs,
                           'db_use': True/False}}
                           
    name_of_function must be a function in the functions module or a
    method of the Server
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
        """
        Connects the server to a specific socket
        """
        
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
        """
        Starts the server loop, and contains the code that is looped by
        the server
        """
        
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
        """
        Check if any connections have been established
        """
        conns = select_.select([self.socket], [], [], 0)[0]
        if len(conns) > 0:
            conn, addr = self.socket.accept()
            conn.setblocking(0)
            
            client_thread = New_Thread(func=self.handle_client,
                                       args_in={'conn': conn, 'addr': addr})
            client_thread.start()
            
    def handle_client(self, conn=None, addr=None):
        """
        Run when a connection has been extablished. Looking for a
        message through the connected socket
        """
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
        """
        Interpret the message that is received by the server
        """
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
        """
        Check for tasks that are ready to be run and finished tasks
        that can be removed
        """
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
        """
        Check the output from a finished task and determines whether
        the task should be removed from the queue
        """
        if task.loop is False:
            out_str = ''
            server_log = ''
            if task.output['status'] == 'finished':
                out_str = task.output['message']
                server_log = 'Task: %s :: finished'
            elif task.output['status'] == 'force_stop':
                out_str = task.output.get('message', 'No Message')
                server_log = 'Task: %s :: force stopped'
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
            
            try:
                conn = self.connections[task.id]    
                conn.send(out_str)
                conn.close()
                
            except:
                pass # There is not connection for this task
                task.status = 'complete'

        else:
            task.status = 'stopped'
            
        if task.db_use is True:
            self.db_open = True
            
    def cleanup(self):
        """
        Remove tasks that have completed their work and the connections
        associated with them
        """
        
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
        """
        Returns what the server is 'doing'. Can be used to send the UI
        info about the server
        """
        return {'status': 'finished',
                'message': "{'queue': %s, \
                              'connections': %s}" % (self.queue,
                                                    self.connections)}
    
    def talk(self):
        """
        Prints a monitoring message from the server
        """
        
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
        """
        Add a new string onto the output string from the server. It
        loops at 15 lines for the print statement
        """
        
        if len(self.print_out.splitlines()) < 15:
            self.print_out += '\n' + add_str
        else:
            self.print_out = '\n' + add_str
        
    def log(self, message='', which=''):
        """
        Logs a message to either the shakecast or server log
        """
        if which == 'shakecast':
            log_file = self.sc_log_file
        else:
            log_file = self.log_file
            
        date_time = time.strftime('%c')    
            
        with open(log_file, 'a') as file_:
            file_.write('%s%s%s\n' % (date_time, ':: ', message))
    
    def stop_task(self, task_name=None):
        """
        Sets a looping task's status to 'Finished'
        """
        message = ''
        status = ''
        for task in self.queue:
            if task.name == task_name:
                task.loop = False
                if task.status == 'stopped':
                    task.status = 'finished'
                    message += 'Stopped %s' % task.name
                else:
                    message += '%s is currently running, but will stop when finished' % task.name
                
        self.make_print(message)
        return {'status': 'finished',
                'message': message}
    
            
    def ui_exit(self):
        """
        Determine if the server should shutdown when the UI exits
        """
        
        if self.ui_open is True:
            self.shutdown()
            msg = "Stopping server..."
        else:
            msg = "Bye!"
            
        return {'status': 'finished',
                'message': msg}
    
    def start_shakecast(self):
        try:
            status = ''
            message = ''
            task_names = [task.name for task in self.queue]
            if 'geo_json' not in task_names:
                task = Task()
                task.id = int(time.time() * 1000000)
                task.func = geo_json
                task.loop = True
                task.interval = 60
                task.db_use = True
                task.name = 'geo_json'
            
                self.queue += [task]
                message += 'Started monitoring earthquake feed \n'
            else:
                pass
            
            if 'check_new' not in task_names:
                task = Task()
                task.id = int(time.time() * 1000000)
                task.func = check_new_shakemaps
                task.loop = True
                task.interval = 3
                task.db_use = True
                task.name = 'check_new'
                
                self.queue += [task]
                message += "Waiting for new events"
            else:
                pass
            status = 'finished'
        except:
            status = 'failed'
        
        
        return {'status': status,
                'message': message}
    
    def stop_shakecast(self):
        """
        Removes the Tasks associated with ShakeCast services from the
        queue if they are stopped and stops them from running again if
        they are currently running
        """
        status = ''
        message = ''
        
        try:
            stop_geo = self.stop_task('geo_json')
            stop_check = self.stop_task('check_new')
            
            status = 'finished'
            
            if stop_geo['status'] == 'finished':
                message += '%s \n' % stop_geo['message']
            else:
                message += 'Failed to stop json monitoring. Either ShakeCast is \n\
                            not responding or json monitoring was not running'
            if stop_check['status'] == 'finished':
                message += '%s \n' % stop_check['message']
            else:
                message += 'Failed to stop waiting for events. Either ShakeCast \n\
                            is not responding or monitoring was not running'
        except:
            status = 'failed'
        return {'status': status,
                'message': message}
    
    def stop(self):
        """
        Stop server loop; It will be restarted immediately. This
        functionality could be used to reload functions in the event
        of an update
        """
        
        self.stop_loop = True
        return {'status': 'finished',
                'message': 'Stopping loop...'}
    
    def shutdown(self):
        """
        Shuts down the server allowing currently running tasks to
        finish
        """
        
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
    
