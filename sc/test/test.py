import unittest
import os
import sys
from email.mime.text import MIMEText
import time
path = os.path.dirname(os.path.abspath(__file__)).split(os.sep)
del path[-1]
path = os.path.normpath(os.sep.join(path))
if path not in sys.path:
    sys.path += [path]
from app.functions import *
from app.task import Task

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


class TestProductGrabber(unittest.TestCase):
    '''
    Test functions for the ProductGrabber class
    '''
    def test_initProductGrabber(self):
        '''
        Test product grabber initialization
        Fails when there is an error in the code
        '''
        pg = ProductGrabber()
        
    def test_getJSONFeed(self):
        '''
        Tests access to the USGS JSON feed. Failure points to error in
        code, lack of internet access, or a down USGS server
        '''
        pg = ProductGrabber()
        pg.get_json_feed()
        
        self.assertNotEqual(pg.json_feed, '')

    def test_geoJSON(self):
        result = geo_json('hour')
        self.assertEqual(result['error'], '')

class TestMailer(unittest.TestCase):
    '''
    Test the connection to the SMTP server
    '''
    def test_initMailer(self):
        '''
        Fails when the Mailer is unable to initialize. Failure
        is caused by code errors or proxy access
        '''
        m = Mailer()
    
    def test_sendMail(self):
        '''
        Send an email with Mailer object. Will fail with code errors or
        failure to reach SMTP server
        '''
        m = Mailer()
        
        you = self.email
        msg = MIMEText('This email is a test of your ShakeCast SMTP server')
        msg['Subject'] = 'ShakeCast SMTP TEST'
        msg['From'] = m.me
        msg['To'] = you
        
        m.send(msg=msg, you=you)
        
        
class TestSC(unittest.TestCase):
    '''
    Test the ShakeCast configuration object. Fails if code errors
    '''
    def test_initSC(self):
        sc = SC()

class TestTemplateManager(unittest.TestCase):
    '''
    Test the ShakeCast notification configuration. Fails if code errors
    '''

    def test_notificationConfigs(self):
        temp_manager = TemplateManager()
        configs = temp_manager.get_configs('new_event', 'default')
        self.assertIsNotNone(configs)
        configs = temp_manager.save_configs('new_event', 'default', configs)
        self.assertIsNotNone(configs)
    
    def test_badNotificationConfigs(self):
        temp_manager = TemplateManager()
        bad_configs = temp_manager.get_configs('new_event', 'template_DOES_NOT_EXIST_!@#$')
        default = temp_manager.get_configs('new_event', 'default')

        self.assertEqual(bad_configs, default)

        bad_configs = temp_manager.save_configs('new_event', 'template_DOES_NOT_EXIST_!@#$', None)
        self.assertIsNone(bad_configs)

    def test_getTemplate(self):
        temp_manager = TemplateManager()
        temp = temp_manager.get_template('new_event', 'default')
        self.assertIsNotNone(temp)

    def test_badTemplate(self):
        temp_manager = TemplateManager()
        temp = temp_manager.get_template('new_event', 'template_DOES_NOT_EXIST_!@#$')
        self.assertIsNotNone(temp)

        temp = temp_manager.get_template_string('new_event', 'template_DOES_NOT_EXIST_!@#$')
        self.assertIsNone(temp)

    def test_templateNames(self):
        temp_manager = TemplateManager()
        temp_names = temp_manager.get_template_names()
        self.assertIn('default', temp_names)

    def test_NewTemp(self):
        temp_manager = TemplateManager()
        result = temp_manager.create_new('default')

        self.assertTrue(result)

class TestURLOpener(unittest.TestCase):
    '''
    Test the URLOpener Object
    '''
    def test_initURLOpener(self):
        '''
        Test URLOpener initialization
        '''
        url_opener = URLOpener()
        
    def test_OpenURL(self):
        '''
        Open a URL with URLOpener. Will fail with code errors or lack
        of internet connection
        '''
        url_opener = URLOpener()
        google = url_opener.open('https://www.google.com')


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
        

class TestFull(unittest.TestCase):
    '''
    Test the individual ShakeCast functions
    '''
    def step01_createUser(self):
        session = Session()
        user1 = create_user('GLOBAL', self.email)
        user2 = create_user('GLOBAL_SCENARIO', self.email)

        session.add(user1)
        session.add(user2)

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
        session.add(global_group)
        session.add(scenario_group)
        session.add(high_prio)

        session.commit()
        Session.remove()
        
    def step04_addUsersToGroups(self):
        session = Session()
        add_users_to_groups(session=session)
        session.commit()
        Session.remove()
        
    def step05_geoJSON(self):
        '''
        Test run of geo_json
        '''    
        data = geo_json('hour')
        self.assertEqual(data['error'], '')

        # grab some prepackaged geoJSON to ensure we have some 
        # events and shakemaps for testing
        json_file = os.path.join(sc_dir(), 'test', 'test_json_feed.json')
        with open(json_file, 'r') as file_:
            json_feed = json.loads(file_.read())
        pg = ProductGrabber()
        pg.json_feed = json_feed
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
                f.name = 'GREY FAC'
                f.grey = 0
                f.green = 10
                f.yellow = -1
                f.orange = 12
                f.red = 13
                session.add(f)

                f = create_fac(grid=grid)
                f.name = 'No Metric'
                f.metric = 'PSA-Not-In-ShakeMap'
                session.add(f)

            session.commit()

        grid.in_grid(facility=f)
    
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
                if (notification.status != 'sent' and 
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
                    raise ValueError('Notification not sent... {}: {}, {}'.format(shakemap.shakemap_id,
                                                                                  notification.notification_type,
                                                                                  notification.status))
        Session.remove()
    
    def step11_eventDownload2(self):
        '''
        Second event download to hit more code
        '''

        # grab some prepackaged geoJSON to ensure we have some 
        # events and shakemaps for testing
        json_file = os.path.join(sc_dir(), 'test', 'test_json_feed.json')
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

    def step16_NewUpdate(self):
        s = SoftwareUpdater()
        new = s.check_new_update('1.1.1', '1.0.1')
        self.assertTrue(new)
        new = s.check_new_update('1.1.2', '1.1.1')
        self.assertTrue(new)
        new = s.check_new_update('2.0.0', '1.1.1')
        self.assertTrue(new)
        new = s.check_new_update('1.1.1', '1.1.1')
        self.assertFalse(new)
        new = s.check_new_update('1.1.1b2', '1.1.1b1')
        self.assertTrue(new)
        new = s.check_new_update('1.1.1b2', '1.1.1b2')
        self.assertFalse(new)
        new = s.check_new_update('1.1.2b0', '1.1.1b2')
        self.assertTrue(new)
        new = s.check_new_update('1.1.2b2', '1.1.1b2')
        self.assertTrue(new)
        new = s.check_new_update('1.1.2b3', '1.1.1b2')
        self.assertTrue(new)
        new = s.check_new_update('1.1.1rc2', '1.1.1rc1')
        self.assertTrue(new)
        new = s.check_new_update('1.1.1rc2', '1.1.1rc2')
        self.assertFalse(new)
        new = s.check_new_update('1.1.2rc0', '1.1.1rc2')
        self.assertTrue(new)
        new = s.check_new_update('1.1.2rc2', '1.1.1rc2')
        self.assertTrue(new)
        new = s.check_new_update('1.1.2rc3', '1.1.1rc2')
        self.assertTrue(new)
        new = s.check_new_update('1.1.2', '1.1.1rc2')
        self.assertTrue(new)
        new = s.check_new_update('1.1.2rc1', '1.1.1')
        self.assertFalse(new)
        new = s.check_new_update('1.1.2b5', '1.1.2rc1')
        self.assertFalse(new)
        new = s.check_new_update('1.1.2rc1', '1.1.2b5')
        self.assertTrue(new)

    def step17_CheckUpdate(self):
        s = SoftwareUpdater()
        s.json_url = os.path.normpath(delim.join(['file://', 
                                                    sc_dir(), 
                                                    'test', 
                                                    'update_test.json']))
        s.check_update(testing=True)
    
    def step18_Update(self):
        s = SoftwareUpdater()
        s.json_url = os.path.normpath(delim.join(['file://', 
                                                    sc_dir(), 
                                                    'test', 
                                                    'update_test.json']))
        s.update(testing=True)

    def step19_NotifyAdmin(self):
        s = SoftwareUpdater()
        s.notify_admin()

    def step20_UpdateFunction(self):
        check_for_updates()

    def step21_AlchemyEncoder(self):
        '''
        Runs through a default use case of the Alchemy Encoder
        '''
        session = Session()
        events = session.query(Event).all()
        events_json = json.dumps(events, cls=AlchemyEncoder)
        Session.remove()
        event_dict = json.loads(events_json)
        self.assertTrue(len(event_dict) > 0)

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

    def step23_badScenario(self):
        result = run_scenario('a_bad_Event_id')
        self.assertFalse(result['message']['success'])

    def step24_downloadBadScenario(self):
        result = download_scenario('not_a_real_scenario')
        self.assertEqual('failed', result['status'])

    def step25_downloadActualScenario(self):
        download_scenario('bssc2014sanjacintolytlecreek_m6p72_se', scenario=True)

    def step26_groupInspLevel(self):
        session = Session()
        g = session.query(Group).first()
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
        Session.remove()

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
    

class TestImport(unittest.TestCase):
    '''
    Run tests on the XML import functions
    '''
    def step01_clearData(self):
        '''
        Clear the user, group, and facility data from the test database
        '''
        session = Session()
        users = session.query(User).all()
        groups = session.query(Group).all()
        facilities = session.query(Facility).all()
        
        user_ids = [user.shakecast_id for user in users]
        group_ids = [group.shakecast_id for group in groups]
        facility_ids = [facility.shakecast_id for facility in facilities]

        delete_inventory_by_id(inventory_type='user', ids=user_ids)
        delete_inventory_by_id(inventory_type='group', ids=group_ids)
        delete_inventory_by_id(inventory_type='facility', ids=facility_ids)

        users = session.query(User).all()
        groups = session.query(Group).all()
        facilities = session.query(Facility).all()
        self.assertEqual(users, [])
        self.assertEqual(groups, [])
        self.assertEqual(facilities, [])

        Session.remove()

    def step02_userImport(self):
        user_file = os.path.join(sc_dir(), 'test', 'test_users.xml')
        file_type = determine_xml(user_file)
        import_user_xml(user_file)
        
        session = Session()
        users = session.query(User).all()
        id1 = users[0].shakecast_id
        id2 = users[1].shakecast_id
        Session.remove()

        import_user_xml(user_file, id1)
        import_user_xml(user_file, id2)

        self.assertEqual(file_type, 'user')

    def step03_groupImport(self):
        group_file = os.path.join(sc_dir(), 'test', 'test_groups.xml')
        file_type = determine_xml(group_file)
        import_group_xml(group_file, 1)
        self.assertEqual(file_type, 'group')
        
    def step04_facImport(self):
        fac_file = os.path.join(sc_dir(), 'test', 'test_facs.xml')
        file_type = determine_xml(fac_file)
        import_facility_xml(fac_file, 1)
        self.assertEqual(file_type, 'facility')

    def step05_checkUser(self):
        session = Session()
        users = session.query(User).all()
        
        failed = False
        failed_str = ''
        if len(users) != 3:
            failed_str += 'Incorrect number of users: {}'.format(len(users))
            failed = True
        for user in users:
            if user.username == 'Ex1':
                if len(user.groups) != 0:
                    failed_str += '\nIncorrect number of groups: {}, {}'.format(user.username, len(user.groups))
                    failed = True
            elif user.username == 'Ex2':
                if len(user.groups) != 1:
                    failed_str += '\nIncorrect number of groups: {}, {}'.format(user.username, len(user.groups))
                    failed = True
            elif user.username == 'Ex3':
                if len(user.groups) != 3:
                    failed_str += '\nIncorrect number of groups: {}, {}'.format(user.username, len(user.groups))
                    failed = True
        
        if failed is True:
            raise ValueError(failed_str)        
        
        Session.remove()
        
    def step06_checkGroup(self):
        session = Session()
        groups = session.query(Group).all()
        
        failed = False
        failed_str = ''
        if len(groups) != 3:
            failed_str += '\nIncorrect number of groups: {}'.format(len(groups))
            failed = True
        
        for group in groups:
            if group.name == 'DU':
                if len(group.users) != 1:
                    failed_str += '\nIncorrect number of users: {}, {}'.format(group.name, len(group.users))
                    failed = True
                min_mag = group.get_min_mag()
                self.assertTrue(min_mag > 0)
                self.assertTrue(group.check_min_mag(10))

            elif group.name == 'CAL_BRIDGES':
                if len(group.users) != 2:
                    failed_str += '\nIncorrect number of users: {}, {}'.format(group.name,
                                                                               len(group.users))
                    failed = True

                self.assertTrue(group.has_alert_level('green'))
                self.assertTrue('green' in group.get_alert_levels())
            elif group.name == 'CAL_BRIDGES_SCENARIO':
                if len(group.users) != 1:
                    failed_str += '\nIncorrect number of users: {}, {}'.format(group.name,
                                                                               len(group.users))
                    failed = True
                self.assertTrue(group.has_spec('scenario'))
                self.assertTrue('green' in group.get_scenario_alert_levels())

            self.assertEqual('Ex1', group.updated_by)
        
        if failed is True:
            raise ValueError(failed_str)
        
        Session.remove()
        
    def step07_checkFacs(self):
        session = Session()
        facs = session.query(Facility).all()
        
        failed = False
        failed_str = ''
        if len(facs) != 2:
            failed_str += '\nIncorrect number of facs: {}'.format(len(facs))
            failed = True
            
        for fac in facs:
            if fac.facility_id == 1:
                if len(fac.groups) != 2:
                    failed_str += '\nIncorrect number of groups: {}, {}'.format(fac.facility_id,
                                                                                len(facs))
                    failed = True
            elif fac.facility_id == 2:
                if len(fac.groups) != 1:
                    failed_str += '\nIncorrect number of groups: {}, {}'.format(fac.facility_id,
                                                                                len(facs))
                    failed = True
          
            self.assertEqual('Ex1', fac.updated_by)

        if failed is True:
            raise ValueError(failed_str)
                    
        Session.remove()

    def step08_userImport2(self):
        self.step02_userImport()
        
    def step09_groupImport2(self):
        self.step03_groupImport()
        
    def step10_facImport2(self):
        self.step04_facImport()
                
    def step11_removeData(self):
        self.step01_clearData()

    def step12_masterImport(self):
        file_ = os.path.join(sc_dir(), 'test', 'test_master.xml')
        file_type = determine_xml(file_)
        import_master_xml(file_)

        self.assertEqual(file_type, 'master')

    def step13_facilityInfo(self):
        info = get_facility_info(group_name='bad_group', shakemap_id='no_shakemap')
        self.assertEqual({}, info)
        
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

def create_fac(grid=None, fac_id='AUTO_GENERATED'):
    '''
    Create a facility that is inside of a grid with generic fragility
    '''
    
    facility = Facility()
    if grid:
        lat_adjust = abs((grid.lat_max - grid.lat_min) / 10)
        lon_adjust = abs((grid.lon_max - grid.lon_min) / 10)
        facility.lat_min = grid.lat_min + lat_adjust
        facility.lat_max = facility.lat_min + (2 * lat_adjust)
        facility.lon_min = grid.lon_min + lon_adjust
        facility.lon_max = facility.lon_min + (2 * lon_adjust)
    
    facility.facility_id = fac_id
    facility.facility_type = 'Bridge'
    facility.name = 'No Name'
    facility.metric = 'MMI'
    facility.grey = 0
    facility.green = 3
    facility.yellow = 5
    facility.orange = 6
    facility.red = 7
    facility.grey_beta = .64
    facility.green_beta = .64
    facility.yellow_beta = .64
    facility.orange_beta = .64
    facility.red_beta = .64
    
    return facility
    
def create_group(name=None, 
                    event_type='ACTUAL', 
                    insp_prios=['GREY', 
                                'GREEN', 
                                'YELLOW', 
                                'ORANGE', 
                                'RED']):
    group = Group()
    group.name = name
    group.facility_type = 'All'
    group.lon_min = -180
    group.lon_max = 180
    group.lat_min = -90
    group.lat_max = 90
    
    gs = Group_Specification()
    gs.notification_type = 'NEW_EVENT'
    gs.minimum_magnitude = 3
    gs.notificaiton_format = 'EMAIL_HTML'
    gs.event_type = event_type
    group.specs.append(gs)
    
    gs = Group_Specification()
    gs.notification_type = 'heartbeat'
    gs.event_type = 'heartbeat'
    group.specs.append(gs)
    
    for insp_prio in insp_prios:
        gs = Group_Specification()
        gs.event_type = event_type
        gs.notification_type = 'DAMAGE'
        gs.minimum_magnitude = 3
        gs.notificaiton_format = 'EMAIL_HTML'
        gs.inspection_priority = insp_prio
        group.specs.append(gs)

    return group

def create_user(group_str=None, email=None):
    user = User()
    user.username = 'test_user'
    user.email = email
    user.user_type = 'ADMIN'
    user.group_string = group_str

    return user

def fail_test():
    '''
    A test to inject into the system_test function forcing it to run
    its fail routines
    '''
    raise ValueError('This test fails on purpose')

if __name__ == '__main__':
    
    # If the user wants to make sure they can get emails, they should
    # be able to specify an email address for each test run
    if len(sys.argv) > 1:
        email = sys.argv[1]
        del sys.argv[1]
        if (('@' in email) and
                ('.' in email) and
                ('com' in email or
                 'gov' in email or
                 'org' in email or
                 'edu' in email)):
            unittest.TestCase.email = email
    else:
        unittest.TestCase.email = 'test@test.com'
            
    unittest.main()
        