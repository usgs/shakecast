import unittest
import os
import sys
from email.mime.text import MIMEText
import time
from shakecast.app.eventprocessing import check_new, process_events, process_shakemaps, run_scenario
from shakecast.app.grid import create_grid
from shakecast.app.inventory import add_facs_to_groups, add_users_to_groups
from shakecast.app.productdownload import geo_json, download_scenario
from shakecast.app.servertestfunctions import system_test
from shakecast.app.task import Task
from shakecast.app.util import merge_dicts, Clock, SC
from .util import create_fac, create_group, create_user
from .eventprocessing import *
from .grid import *
from .impact import *
from .inventory import *
from .jsonencoders import *
from .notifications import *
from .orm import *
from .productdownload import *
from .products import *
from .urlopener import *

class SystemTest(unittest.TestCase):
    '''
    System Test
    '''
    def test_systemTest(self):
        '''
        Test user run system tests
        '''
        # all these tests should pass
        result = system_test()
        self.assertTrue(result['message']['success'])

        # insert a test that raises an error
        result = system_test(add_tests=[{'name': 'fail', 'test': fail_test}])
        self.assertFalse(result['message']['success'])

class TestProbCalc(unittest.TestCase):
    '''
    Check the results of the probability calculation
    '''
    def test_lognorm(self):
        '''
        Pobability calculation
        '''
        result = lognorm_opt(med=.5, spread=.64, shaking=.5)
        self.assertEqual(int(result), 50)
        result = lognorm_opt(med=.5, spread=.64, shaking=10)
        self.assertEqual(int(result), 100)
        result = lognorm_opt(med=.5, spread=.64, shaking=1)
        self.assertTrue(50 < result < 100)
        result = lognorm_opt(med=.5, spread=.64, shaking=0)
        self.assertTrue(0 < result < 50)

class TestDictMerge(unittest.TestCase):
    def test_deepMerge(self):
        dict1 = {
            'non_obj': 'val1',
            'obj1': {
                'non_obj': 'inner_val',
                'inner_obj': {
                    'non_obj': 'inner_val'
                }
            }
        }

        dict2 = {
            'obj1': {
                'inner_obj': {
                    'non_obj': 'new_inner_val',
                    'inner_obj': {
                        'non_obj': 'new_inner_val'
                    },
                    'new_inner_obj': {}
                }
            }
        }

        merge_dicts(dict1, dict2)

        self.assertEqual(dict1['non_obj'], 'val1')
        self.assertEqual(dict1['obj1']['inner_obj']['non_obj'], 'new_inner_val')
        self.assertEqual(dict1['obj1']['inner_obj']['inner_obj']['non_obj'], 'new_inner_val')
        self.assertTrue(isinstance(dict1['obj1']['inner_obj']['new_inner_obj'], dict))

class TestDBConnet(unittest.TestCase):

    def test_setsSession(self):

        @dbconnect
        def needs_session(session=None):
            return session.query(Event).all()

        self.assertTrue(isinstance(needs_session(), list))

    def test_passesSessionKwarg(self):

        @dbconnect
        def needs_session(session=None):
            return session.query(Event).all()

        session = Session()
        self.assertTrue(isinstance(needs_session(session=session), list))
        Session.remove()

    def test_passesSessionArg(self):

        @dbconnect
        def needs_session_and_args(arg1, arg2, session=None, **kwargs):
            return session.query(Event).all()

        session = Session()
        result = needs_session_and_args(
            'arg1',
            'arg2',
            session,
            somekwarg='kwarg'
        )

        self.assertTrue(isinstance(result, list))
        Session.remove()

    def test_handlesDoubleSessionInput(self):

        @dbconnect
        def needs_session_and_args(arg1, arg2, session=None, **kwargs):
            return session.query(Event).all()

        session1 = Session()
        session2 = Session()
        result = needs_session_and_args(
            'arg1',
            'arg2',
            session1,
            somekwarg='kwarg',
            session=session2
        )

        self.assertTrue(isinstance(result, list))
        Session.remove()

    def test_returnsSqlAlchemyObj(self):

        @dbconnect
        def db_returnsSqlA(session=None):
            user = User()
            user.username = 'returnedUser'
            session.add(user)

            return user
        
        user = db_returnsSqlA()
        self.assertTrue(isinstance(user, Base))

    def test_returnsSqlAlchemyObjList(self):

        @dbconnect
        def db_returnsSqlAList(session=None):
            user1 = User()
            user1.username = 'returnedUser1'
            session.add(user1)

            user2 = User()
            user2.username = 'returnedUser2'
            session.add(user2)

            return [user1, user2]

        users = db_returnsSqlAList()
        for user in users:
            self.assertTrue(isinstance(user, Base))

class TestSC(unittest.TestCase):
    '''
    Test the ShakeCast configuration object. Fails if code errors
    '''
    def test_initSC(self):
        sc = SC()


class TestClock(unittest.TestCase):
    '''
    Tests for the Clock object
    '''
    def test_initClock(self):
        '''
        Test clock initialization
        '''
        c = Clock()
    
    def test_getTime(self):
        c = Clock()
        c.get_time()
        
    def test_nightTime(self):
        c = Clock()
        c.nighttime()
        
    def test_fromTime(self):
        c = Clock()
        c.from_time(time.time())

class TestTask(unittest.TestCase):
    '''
    Test the Task object the SC server uses to compelte jobs
    '''
    def test_initTask(self):
        t = Task()
    
    def test_FuncNoArgs(self):
        def func():
            for i in range(1000):
                pass
            
        t = Task()
        t.func = func
        t.run()
        
    def test_FuncArgs(self):
        def func(some_arg=0):
            for i in range(some_arg):
                pass
        
        t = Task()
        t.func = func
        t.args_in = {'some_arg': 1000}
        t.run()

    def test_LoopSets(self):
        def func():
            for i in range(1000):
                pass
            
        t = Task()
        t.func = func
        t.loop = True
        t.interval = 100000
        t.run()

        self.assertTrue(t.next_run > time.time())

def fail_test():
    '''
    A test to inject into the system_test function forcing it to run
    its fail routines
    '''
    raise ValueError('This test fails on purpose')

if __name__ == '__main__':
    set_email()
    unittest.main()
        