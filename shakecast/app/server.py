import socket
import select as select_
import time
import os
import sys
import json

from newthread import NewThread
from task import Task
import functions as f
from util import *
from startup import startup
from sc_logging import server_logger as logging

class Server(object):
    
    """
    The ShakeCast server is essentially the "conductor" of the system.
    It keeps track of which functions (Tasks) are supposed to run and
    when. It provides an API that can be utilized through the CLI
    and eventually the GUI.
    ::
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
        self.sleep = 2
        self.connections = {}
        self.connected = False
        self.queue = []
        self.print_out = ''
        self.silent = False
        self.ui_open = False
        self.last_task = 0
        self.db_open = True
        self.messages = {}
        self.debug_only = [
            'fast_geo_json',
            'check_new',
            'check_for_updates',
            'record_messages',
            'send_notifications',
            'create_products'
        ]
        
        sc = SC()
        self.port = sc.dict['port']
        self.socket_setup()
        
    def socket_setup(self):
        """
        Connects the server to a specific socket
        """
        attempts = 0
        while self.connected is False and attempts < 20:
            try:
                self.socket.bind(('', self.port))
                self.socket.listen(5)
                self.connected = True
                
            except:
                logging.info('Failed to get port {} for ShakeCast server. Shakecast is either already running or another application is using the port.'.format(self.port))
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
            
            client_thread = NewThread(func=self.handle_client,
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

            logging.info('Bad Command: {}'.format(data))
            
        if good_data is True:
            for key, value in new_task_dict.iteritems():
                task_id = int(time.time() * 1000000)
                try:
                    db_use = value.pop('db_use')
                except:
                    db_use = False
                    
                new_task = Task(name=key, task_id=task_id, db_use=db_use, from_user=True, **value)
                
                logging.info('Task added to Queue: {}'.format(str(new_task)))
                if new_task.loop is True:
                    conn.send('Received looping task. Closing connection...')
                    conn.close()
                else:
                    self.connections[task_id] = conn
                
                self.queue += [new_task]
                
    def queue_check(self):
        """
        Check for tasks that are ready to be run and finished tasks
        that can be removed
        """
        timestamp = time.time()
        sc = SC()
        for i,task in enumerate(self.queue):
            # run tasks if it's their time and they aren't already running
            # and the db is available
            if ((task.next_run < timestamp and 
                    task.status == 'stopped') and
                        (task.db_use is False or 
                            self.db_open is True or 
                            (sc.dict['DBConnection']['type'] != 'sqlite' and 
                                task.from_user is True))):
                    
                    if task.db_use is True:
                        self.db_open = False
                    
                    self.last_task = time.time()
                    
                    if ((task.name not in self.debug_only)):
                        logging.info('Running task: {}'.format(task.name))
                    else:
                        logging.debug('Running task: {}'.format(task.name))

                    task_thread = NewThread(func=task.run)
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
        if task.output and type(task.output) is not dict:
            task.output = task.output.__dict__
        if task.loop is False:
            out_str = ''
            server_log = ''
            if task.output.get('status') == 'finished':
                out_str = task.output.get('message')
                server_log = 'Task: %s :: finished'
            elif task.output.get('status') == 'force_stop':
                out_str = task.output.get('message', 'No Message')
                server_log = 'Task: %s :: force stopped'
            elif task.output.get('status') == 'failed':
                out_str = "FAILED: %s" % task.output.get('message')
                server_log = 'Task: %s :: failed to finish'
            elif task.status == 'failed':
                out_str = '{} failed to run... \n{}: {}'.format(task.name,
                                                                type(task.error),
                                                                task.error)
                server_log = 'Task: {} :: failed to run \n{}: {}'.format(task.name,
                                                                         type(task.error),
                                                                         task.error)

            int_time = int(time.time())
            self.messages[int_time] = out_str
            if task.id in self.connections.keys():
                conn = self.connections[task.id]
                conn.send(str(self.messages))
                conn.close()

            task.status = 'complete'

        else:
            task.status = 'stopped'

        # only log results from failed normal tasks or abnormal tasks
        if ((task.name not in self.debug_only) or
                    task.error or (task.output and task.output.get('error'))):
            logging.info('{}: \n\tSTATUS: {} \n\tOUTPUT: {}'.format(task.name,
                                                                    task.status,
                                                                    task.output))
        else:
            # if we're debugging, log everything
            logging.debug('{}: \n\tSTATUS: {} \n\tOUTPUT: {}'.format(task.name,
                                                                    task.status,
                                                                    task.output))
            
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

        int_time = int(time.time())
        # remove messages after 5 minutes
        for mes_time in self.messages.keys():
            if int_time - mes_time > 300:
                del self.messages[mes_time]

        
    def info(self):
        """
        Returns what the server is 'doing'. Can be used to send the UI
        info about the server
        """
        return {'status': 'finished',
                'message': "{'queue': %s, \
                              'connections': %s}" % (self.queue,
                                                    self.connections)}
    
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
        logging.info('Starting ShakeCast Server... ')
        try:
            status = ''
            message = ''
            task_names = [task.name for task in self.queue]

            if 'fast_geo_json' not in task_names:
                task = Task()
                task.id = int(time.time() * 1000000)
                task.func = f.geo_json
                task.loop = True
                task.interval = 60
                task.db_use = True
                task.name = 'fast_geo_json'
                task.args_in = {'query_period': 'hour'}
            
                self.queue += [task]
                message += 'Started monitoring earthquake feed \n'

            if 'day_geo_json' not in task_names:
                task = Task(run_in=DAY)
                task.id = int(time.time() * 1000000)
                task.func = f.geo_json
                task.loop = True
                task.interval = 60
                task.db_use = True
                task.name = 'day_geo_json'
                task.args_in = {'query_period': 'day'}
            
                self.queue += [task]
                message += 'Started monitoring earthquake feed \n'
            
            if 'check_new' not in task_names:
                task = Task()
                task.id = int(time.time() * 1000000)
                task.func = f.check_new
                task.loop = True
                task.interval = 3
                task.db_use = True
                task.name = 'check_new'
                
                self.queue += [task]
                message += "Waiting for new events"

            if 'create_products' not in task_names:
                task = Task()
                task.id = int(time.time() * 1000000)
                task.func = f.create_products
                task.loop = True
                task.interval = 3
                task.db_use = True
                task.name = 'create_products'

                self.queue += [task]

            if 'send_notifications' not in task_names:
                task = Task()
                task.id = int(time.time() * 1000000)
                task.func = f.inspection_notification_service
                task.loop = True
                task.interval = 3
                task.db_use = True
                task.name = 'send_notifications'

                self.queue += [task]

            if 'record_messages' not in task_names:
                task = Task()
                task.id = int(time.time() * 1000000)
                task.func = self.record_messages
                task.loop = True
                task.interval = 2
                task.name = 'record_messages'

                self.queue += [task]
                message += "Recording messages"

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
        logging.info('ShakeCast Server Stopped...')
        return {'status': 'finished',
                'message': 'Stopping server...'}

    @staticmethod
    def restart():
        """
        Stops the current ShakeCast system and starts a new one. Used
        after software updates or in case of error
        """
        # get the admin directory:
        split_sc_dir = sc_dir().split(os.sep)
        split_admin_dir = split_sc_dir[:-1] + ['admin']

        # determine which OS type we're on and which program to run
        if os.sep == '/':
            sys_type = 'Linux'
            program = 'restart_shakecast.sh'
            split_restart = split_admin_dir + [sys_type, program]
            restart = 'sudo bash ' + os.path.normpath(os.sep.join(split_restart))
        else:
            sys_type = 'Windows'
            program = 'restart_shakecast.cmd'
            split_restart = split_admin_dir + [sys_type, program]
            restart = os.path.normpath(os.sep.join(split_restart))
        # concatinate the full restart command

        # and run it
        os.system(restart)


    def record_messages(self):
        fname = os.path.join(get_tmp_dir(), 'server-messages.json')

        # initialize file if it doesn't exist
        if not os.path.isfile(fname):
            with open(fname, 'w') as file_:
                file_.write('{}')

        with open(fname, 'r') as file_:
            current_messages_str = file_.read()

        keep_messages = {}
        if current_messages_str:
            current_messages = json.loads(current_messages_str)

            # figure out which current messages we should keep
            for key in current_messages.keys():
                if int(key) > time.time() - 300:
                    keep_messages[key] = current_messages[key]

        # add current messages
        for key in self.messages.keys():
            keep_messages[key] = self.messages[key]

        keep_messages_str = json.dumps(keep_messages, indent=4)
        with open(fname, 'w') as file_:
            file_.write(keep_messages_str)


if __name__ == '__main__':
    logging.info('Starting shakecast server.')
    startup()
    sc_server = Server()
    if sc_server.connected is True:
        # start shakecast
        sc_server.start_shakecast()
        sc_server.loop()
    else:
        logging.info('Unable to bind to port {}, shutting down...'.format(sc_server.port))
    
