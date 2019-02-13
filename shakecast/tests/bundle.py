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
from util import create_fac, create_group, create_user
from .grid import *
from .impact import *
from .inventory import *
from .jsonencoders import *
from .notifications import *
from .productdownload import *
from .updates import *
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

    def test_catchesError(self):

        @dbconnect
        def db_failure(session=None):
            raise(Exception('Testing Error'))
        
        try:
            db_failure()
        except Exception as e:
            self.assertEqual(str(e), 'Testing Error')

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
            for i in xrange(1000):
                pass
            
        t = Task()
        t.func = func
        t.run()
        
    def test_FuncArgs(self):
        def func(some_arg=0):
            for i in xrange(some_arg):
                pass
        
        t = Task()
        t.func = func
        t.args_in = {'some_arg': 1000}
        t.run()

    def test_LoopSets(self):
        def func():
            for i in xrange(1000):
                pass
            
        t = Task()
        t.func = func
        t.loop = True
        t.interval = 100000
        t.run()

        self.assertTrue(t.next_run > time.time())

class TestFull(unittest.TestCase):
    '''
    Test the individual ShakeCast functions
    '''
    def step01_createUser(self):
        session = Session()
        user1 = create_user('GLOBAL', self.email)
        user2 = create_user('GLOBAL_SCENARIO', self.email)
        user3 = create_user('NO_NEW_EVENT:NO_INSP:ALL', self.email)
        user4 = create_user('MMS', None, self.email)

        session.add(user1)
        session.add(user2)
        session.add(user3)
        session.add(user4)

        session.commit()
        Session.remove()

    def step02_createSmallGroup(self):
        session = Session()
        
        small_group = create_group(name='small')
        small_group.lat_min = -1
        small_group.lat_max = 1
        small_group.lon_min = -1
        small_group.lon_max = 1

        session.add(small_group)

        session.commit()
        Session.remove()

    def step03_createGroup(self):
        session = Session()
        
        global_group = create_group(name='GLOBAL')
        scenario_group = create_group(name='GLOBAL_SCENARIO', event_type='SCENARIO')
        high_prio = create_group(name='HIGH_INSP',
                                    insp_prios=['RED'])
        
        no_new_event_group = create_group(name='NO_NEW_EVENT', new_event=False)
        no_insp_group = create_group(name='NO_INSP', insp_prios=[])
        all_group = create_group(name='ALL', event_type='all')
        mms_group = create_group(
            name='MMS',
            event_type='all',
            notification_format='mms'
        )

        session.add(global_group)
        session.add(scenario_group)
        session.add(high_prio)
        session.add(no_new_event_group)
        session.add(no_insp_group)
        session.add(all_group)
        session.add(mms_group)

        session.commit()
        Session.remove()

    @dbconnect
    def step04_addUsersToGroups(self, session=None):
        add_users_to_groups(session=session)
        session.commit()
        
    def step05_geoJSON(self):
        '''
        Test run of geo_json
        '''    
        data = geo_json('hour')
        self.assertEqual(data['error'], '')

        # grab some prepackaged geoJSON to ensure we have some 
        # events and shakemaps for testing
        json_file = os.path.join(sc_dir(), 'tests', 'data', 'test_json_feed.json')
        with open(json_file, 'r') as file_:
            json_feed = json.loads(file_.read())
        pg = ProductGrabber()
        pg.json_feed = json_feed
        pg.read_json_feed()
        new_events, log_message = pg.get_new_events()
        new_shakemaps, log_message = pg.get_new_shakemaps()

        self.assertEqual(len(new_events), 3)
        self.assertEqual(len(new_shakemaps), 2)

        # adjust event times to allow for processing
        session = Session()
        es = session.query(Event).all()
        for e in es:
            e.time = time.time()
        session.commit()
        Session.remove()

    def step06_createFacility(self):
        session = Session()
        sms = session.query(ShakeMap).all()

        if sms:
            for sm in sms:
                grid = create_grid(sm)
                f = create_fac(grid=grid)
                f.name = 'TEST FAC'
                session.add(f)

                f = create_fac(grid=grid)
                f.name = 'No Metric'
                f.metric = 'PSA-Not-In-ShakeMap'
                session.add(f)

                f = create_fac(grid=grid)
                f.name = 'GREY FAC'
                f.grey = 0
                f.green = 10
                f.yellow = -1
                f.orange = 12
                f.red = 13
                session.add(f)

            session.commit()

        self.assertTrue(grid.in_grid(facility=f))

        # quick check of shaking point
        shaking_point = grid.max_shaking(facility=f)
        self.assertTrue(
                shaking_point['LAT'] > f.lat_min and
                shaking_point['LAT'] < f.lat_max and
                shaking_point['LON'] > f.lon_min and
                shaking_point['LON'] < f.lon_max
        )

        # check we get a point still if no metric is available
        metric = copy.copy(f.metric)
        f.metric = 'NOT AVAILABLE'
        shaking_point = grid.max_shaking(facility=f)
        self.assertTrue(
                shaking_point['LAT'] > f.lat_min and
                shaking_point['LAT'] < f.lat_max and
                shaking_point['LON'] > f.lon_min and
                shaking_point['LON'] < f.lon_max
        )

        f.metric = metric

    def step07_addFacsToGroups(self):
        session = Session()
        add_facs_to_groups(session=session)
        session.commit()
        Session.remove()
        
    def step08_checkNew(self):
        data = check_new()
        self.assertEqual(data['error'], '')
    
    def step09_checkEvents(self):
        session = Session()
        events = session.query(Event).all()
        for event in events:
            if event.status != 'processed' and event.status != 'scenario':
                raise ValueError('Event not processed... {}: {}'.format(event.event_id,
                                                                        event.status))
            for notification in event.notifications:
                if ((notification.status != 'sent' or
                    not notification.sent_timestamp) and
                    notification.status != 'aggregated' and
                    (notification.group.name != 'HIGH_INSP' and
                    notification.group.name != 'small')):
                    raise ValueError('Notification not sent to {}... {}: {}, {}'.format(notification.group.name,
                                                                                    event.event_id,
                                                                                    notification.notification_type,
                                                                                    notification.status))
                    
        Session.remove()
        
    def step10_checkShakeMaps(self):
        session = Session()
        shakemaps = session.query(ShakeMap).all()
        for shakemap in shakemaps:
            if shakemap.status != 'processed':
                raise ValueError('ShakeMap not processed... {}: {}'.format(shakemap.shakemap_id,
                                                                           shakemap.status))
            for notification in shakemap.notifications:
                if (notification.status != 'sent' and 
                    notification.status != 'aggregated' and
                    notification.group.name != 'HIGH_INSP'):
                    raise ValueError('Notification not sent to {}... {}: {}, {}'.format(notification.group.name,
                                                                                  shakemap.shakemap_id,
                                                                                  notification.notification_type,
                                                                                  notification.status))
        Session.remove()
    
    def step11_eventDownload2(self):
        '''
        Second event download to hit more code
        '''

        # grab some prepackaged geoJSON to ensure we have some 
        # events and shakemaps for testing
        json_file = os.path.join(sc_dir(), 'tests', 'data', 'test_json_feed.json')
        with open(json_file, 'r') as file_:
            json_feed = json.loads(file_.read())
        pg = ProductGrabber()
        pg.json_feed = json_feed
        
        # add a bad product to make sure it's processed correctly
        pg.pref_products += ['this_product_is_bad']

        new_events, log_message = pg.get_new_events()
        new_shakemaps, log_message = pg.get_new_shakemaps()

    def step12_checkNew2(self):
        '''
        Check new a second time
        '''
        data = check_new()
        self.assertEqual(data['error'], '')

    def step13_notificationAssoc(self):
        '''
        Make sure events and notifications are linked
        '''
        session = Session()
        nots = session.query(Notification).all()
        bad_nots = [n for n in nots if n if n.event_id == None]

        self.assertEqual(len(bad_nots), 0)
        Session.remove()

    def step14_scenarioInDB(self):
        session = Session()
        sms = session.query(ShakeMap).all()
        if len(sms) > 0:
            sm = sms[-1]
            run_scenario(sm.shakemap_id)

        Session.remove()

    def step22_deleteScenario(self):
        session = Session()
        sm = session.query(ShakeMap).first()
        sm_id = sm.shakemap_id
        Session.remove()

        if sm is not None:
            delete_scenario(shakemap_id=sm_id)

            session = Session()
            e = (session.query(Event).filter(Event.event_id == sm_id)
                                        .filter(Event.status == 'scenario')
                                        .first())
            sm = (session.query(ShakeMap).filter(ShakeMap.shakemap_id == sm_id)
                                            .filter(ShakeMap.status == 'scenario')
                                            .first())

            self.assertIsNone(e)
            self.assertIsNone(sm)

        Session.remove()

    @dbconnect
    def step26_groupInspLevel(self, session=None):
        g = session.query(Group).filter(Group.name == 'ALL').first()

        self.assertEqual(g.has_alert_level(None), True)
        self.assertEqual(g.has_alert_level('GREY'), True)
        self.assertEqual(g.has_alert_level('grey'), True)
        self.assertEqual(g.has_alert_level('GRAY'), True)
        self.assertEqual(g.has_alert_level('gray'), True)
        self.assertEqual(g.has_alert_level('GREEN'), True)
        self.assertEqual(g.has_alert_level('green'), True)
        self.assertEqual(g.has_alert_level('YELLOW'), True)
        self.assertEqual(g.has_alert_level('yellow'), True)
        self.assertEqual(g.has_alert_level('ORANGE'), True)
        self.assertEqual(g.has_alert_level('orange'), True)
        self.assertEqual(g.has_alert_level('RED'), True)
        self.assertEqual(g.has_alert_level('red'), True)
        self.assertEqual(g.has_alert_level('does_not_exist'), False)

    def steps(self):
        '''
        Generates the step methods from their parent object
        '''
        for name in sorted(dir(self)):
            if name.startswith('step'):
                yield name, getattr(self, name)
    
    def test_steps(self):
        '''
        Run the individual steps associated with this test
        '''
        # Create a flag that determines whether to raise an error at
        # the end of the test
        failed = False
        
        # An empty string that the will accumulate error messages for 
        # each failing step
        fail_message = ''
        for name, step in self.steps():
            try:
                step()
            except Exception as e:
                # A step has failed, the test should continue through
                # the remaining steps, but eventually fail
                failed = True
                
                # get the name of the method -- so the fail message is
                # nicer to read :)
                name = name.split('_')[1]
                # append this step's exception to the fail message
                fail_message += "\n\nFAIL: {}\n {} failed ({}: {})".format(name,
                                                                           step,
                                                                           type(e),
                                                                           e)
        
        # check if any of the steps failed
        if failed is True:
            # fail the test with the accumulated exception message
            self.fail(fail_message)
    
class TestSCConfig(unittest.TestCase):
    '''
    Tests for the sc configuration script that runs during CI
    '''
    def step1_setupConfigTest(self):
        '''
        Make a copy of the sc.json file to save user configs
        '''
        sc = SC()
        # store smtp information for later testing
        self.username = sc.smtp_username
        self.password = sc.smtp_password
        sc.make_backup()
    
    def step2_SCConfigClear(self):
        '''
        Clear the smtp username and password
        '''
        sc_conf_path = os.path.join(sc_dir(), 'app', 'sc_config.py')
        test_user = 'clear'
        test_pass = 'clear'
        os.system('python {} --smtpu {} --smtpp {}'.format(sc_conf_path,
                                                           test_user,
                                                           test_pass))
        sc = SC()
        self.assertEqual(sc.smtp_username, test_user)
        self.assertEqual(sc.smtp_password, test_pass)
    
    def step3_SCConfigSet(self):
        '''
        Set the smtp username and password
        '''
        sc_conf_path = os.path.join(sc_dir(), 'app', 'sc_config.py')
        test_user = 'testemail@gmail.com'
        test_pass = 'testpass'
        os.system('python {} --smtpu {} --smtpp {}'.format(sc_conf_path,
                                                           test_user,
                                                           test_pass))
        sc = SC()
        self.assertEqual(sc.smtp_username, test_user)
        self.assertEqual(sc.smtp_password, test_pass)
        
    def step4_SCSave(self):
        sc = SC()
        if sc.validate(sc.json) is True:
            sc.save(sc.json)

    def step5_SCRevert(self):
        sc = SC()
        sc.revert()
        
        self.assertEqual(sc.smtp_username, self.username)
        self.assertEqual(sc.smtp_password, self.password)
        
    def steps(self):
        '''
        Generates the step methods from their parent object
        '''
        for name in sorted(dir(self)):
            if name.startswith('step'):
                yield name, getattr(self, name)
    
    def test_steps(self):
        '''
        Run the individual steps associated with this test
        '''
        # Create a flag that determines whether to raise an error at
        # the end of the test
        failed = False
        
        # An empty string that the will accumulate error messages for 
        # each failing step
        fail_message = ''
        for name, step in self.steps():
            try:
                step()
            except Exception as e:
                # A step has failed, the test should continue through
                # the remaining steps, but eventually fail
                failed = True
                
                # get the name of the method -- so the fail message is
                # nicer to read :)
                name = name.split('_')[1]
                # append this step's exception to the fail message
                fail_message += "\n\nFAIL: {}\n {} failed ({}: {})".format(name,
                                                                           step,
                                                                           type(e),
                                                                           e)
        
        # check if any of the steps failed
        if failed is True:
            # fail the test with the accumulated exception message
            self.fail(fail_message)


def fail_test():
    '''
    A test to inject into the system_test function forcing it to run
    its fail routines
    '''
    raise ValueError('This test fails on purpose')

if __name__ == '__main__':
    set_email()
    unittest.main()
        