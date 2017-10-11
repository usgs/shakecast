import time

class Task(object):
    
    """
    Task objects are used to simplify running specific functions with
    specific conditions. A Task is an object that track of a function
    and the parameters under which it should be run. This is an easy
    way to put functions in a queue and let them run later.
    """
    def __init__(self,
                 name="new_task",
                 task_id=None,
                 func=None,
                 conn=None,
                 args_in=None,
                 loop=False,
                 interval=100,
                 run_in=0,
                 kill_time=None,
                 db_use=False,
                 from_user=False,
                 use_pdb=False):
        self.name = name
        self.id = task_id
        self.func = func
        self.conn = conn
        self.args_in = args_in
        self.loop = loop
        self.interval = interval
        self.last_run = 0
        self.status = 'stopped'
        self.next_run = time.time() + run_in
        self.kill_time = None
        self.db_use = db_use
        self.from_user = from_user
        self.output = {'status': '',
                       'messege': ''}
        self.error = ''
        
    def __str__(self):
        return self.name
    
    def __repr__(self):
        return "\n\n%s(id: %s, \n\
                   arguments: %s, \n\
                   loop: %s, \n\
                   interval: %s,\n\
                   db_use: %s) status: %s" % (self.name,
                                                self.id,
                                                self.args_in,
                                                self.loop,
                                                self.interval,
                                                self.db_use,
                                                self.status)        
        
    def run(self):
        self.status = 'running'
        
        if self.func is not None:
            try:
                if self.args_in is not None:
                    self.output = self.func(**self.args_in)
                    
                    self.status = 'finished'
                else:
                    self.output = self.func()
                    self.status = 'finished'
            except Exception as e:
                self.status = 'failed'
                self.error = e
                
            if self.loop is True:
                self.next_run = time.time() + self.interval
                self.last_run = time.time()