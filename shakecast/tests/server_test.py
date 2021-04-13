import socket
# connect to server
# submit single job
# submit bad job
# job that fails
class Server_Test(object):
    def __init__(self):
        self.results = {'error_handling': 'Success'}
        
        self.socket = socket.socket()
        
    def conn_test(self):
        try:
            self.connect_to_server()
            self.socket.close()
            self.results['conn_test'] = 'Success'
        except:
            self.results['conn_test'] = 'Failed'
        
    def task_test(self):
        try:
            self.connect_to_server()
            self.socket.send("{'task_test': {'func': task_test}}")
            
            self.results['task_test'] = self.socket.recv(1000)
        except:
            self.results['task_test'] = 'Failed'
            
    def job_fail(self):
        try:
            self.connect_to_server()
            self.socket.send("{'job_fail_test': {'func': job_fail_test}}")
            
            result = self.socket.recv(1000)
            if 'FAILED' in result:
                self.results['job_fail'] = 'Success'
            else:
                self.results['job_fail'] = 'Failed'
        except:
            self.results['job_fail'] = 'Failed'
            
    def bad_args(self):
        try:
            self.connect_to_server()
            self.socket.send("{'bad_args_test': {'func': task_test, \
                             'args_in': {'bad_arg': 'bad_input'}}}")
            
            result = self.socket.recv(1000)
            
            if 'failed to run' in result:
                self.results['bad_args'] = 'Success'
            else:
                self.results['bad_args'] = 'Failed'
        except:
            self.results['bad_args'] = 'Failed'
    
    
    def bad_command(self):
        try:
            self.connect_to_server()
            self.socket.send("{'bad_command': {'func': fail_test}")
            
            result = self.socket.recv(1000)
            if 'Bad Command' in result:
                self.results['bad_command'] = 'Success'
            else:
                self.results['bad_command'] = 'Failed'
        except:
            self.results['bad_command'] = 'Failed'
            
    def connect_to_server(self):
        self.socket = socket.socket()
        self.socket.settimeout(10)
        self.socket.connect(('', 1981))
        
    def run(self):
        self.conn_test()
        self.task_test()
        self.job_fail()
        self.bad_args()
        self.bad_command()
        self.analyze()
        
    def analyze(self):
        failed = [job for job in list(self.results.keys())
                      if self.results[job] =='Failed']
    
        if failed:
            return_str = '\nFailed Tests: %s' % failed
            if 'conn_test' in failed:
                return_str += '\nServer is most likely down'
            else:
                return_str += '\nServer is up'
                if 'task_test' in failed:
                    return_str += '\nServer is failing to run tasks'
                if ('job_fail' in failed or
                    'bad_args' in failed or
                    'bad_command' in failed):
                    self.results['error_handling'] = 'Failed'
                    return_str += '\nError handling is failing'
                else:
                    self.results['error_handling'] = 'Success'
        else:
            return_str = "Passed all tests"
        
        self.results['analysis'] = return_str
        
    def __str__(self):
        return_str ='''
#---------------------SERVER TEST---------------------#
Connected to Server: %s
Ran Job: %s
Error Handling: %s

Analysis: %s
#------------------------------------------------------# 
''' % (self.results['conn_test'],
       self.results['task_test'],
       self.results['error_handling'],
       self.results['analysis'])
        
        return return_str
    

if __name__ == '__main__':
    st = Server_Test()
    st.run()
    
    print(str(st))
    
        
    
    
    
    
    
