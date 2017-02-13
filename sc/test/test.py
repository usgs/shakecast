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
        self.assertIsNone(bad_configs)
        bad_configs = temp_manager.save_configs('new_event', 'template_DOES_NOT_EXIST_!@#$', bad_configs)
        self.assertIsNone(bad_configs)

    def test_getTemplate(self):
        temp_manager = TemplateManager()
        temp = temp_manager.get_template('new_event', 'default')
        self.assertIsNotNone(temp)

    def test_badTemplate(self):
        temp_manager = TemplateManager()
        temp = temp_manager.get_template('new_event', 'template_DOES_NOT_EXIST_!@#$')
        self.assertIsNone(temp)

    def test_templateNames(self):
        temp_manager = TemplateManager()
        temp_names = temp_manager.get_template_names()
        self.assertIn('default', temp_names)

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


class TestSoftwareUpdater(unittest.TestCase):
    '''
    Test the SoftwareUpdater class
    '''

    def test_NewUpdate(self):
        s = SoftwareUpdater()
        new = s.check_new_update('1.0.0', '1.0.1')
        self.assertFalse(new)
        new = s.check_new_update('1.1.1', '1.0.1')
        self.assertTrue(new)
        new = s.check_new_update('1.1.2', '1.1.1')
        self.assertTrue(new)
        new = s.check_new_update('2.0.0', '1.1.1')
        self.assertTrue(new)
        new = s.check_new_update('0.1.2', '1.1.1')
        self.assertFalse(new)
        new = s.check_new_update('1.1.1', '1.1.1')
        self.assertFalse(new)

    def test_CheckUpdate(self):
        s = SoftwareUpdater()
        s.json_url = 'https://dslosky-usgs.github.io/shakecast/update_test.json'
        s.check_update(testing=True)
    
    def test_Update(self):
        s = SoftwareUpdater()
        s.json_url = 'https://dslosky-usgs.github.io/shakecast/update_test.json'
        s.update(testing=True)

    def test_NotifyAdmin(self):
        s = SoftwareUpdater()
        s.notify_admin()

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
        user = User()
        user.username = 'test_user'
        user.email = self.email
        user.user_type = 'ADMIN'
        user.group_string = 'GLOBAL'
        session.add(user)
        session.commit()
        Session.remove()
        
    def step02_createGroup(self):
        session = Session()
        group = Group()
        group.name = 'GLOBAL'
        group.facility_type = 'All'
        group.lon_min = -180
        group.lon_max = 180
        group.lat_min = -90
        group.lat_max = 90
        session.add(group)
        
        gs = Group_Specification()
        gs.notification_type = 'NEW_EVENT'
        gs.minimum_magnitude = 3
        gs.notificaiton_format = 'EMAIL_HTML'
        group.specs.append(gs)
        
        gs = Group_Specification()
        gs.notification_type = 'heartbeat'
        group.specs.append(gs)
        
        insp_prios = ['GREY', 'GREEN', 'YELLOW', 'ORANGE', 'RED']
        for insp_prio in insp_prios:
            gs = Group_Specification()
            gs.notification_type = 'DAMAGE'
            gs.minimum_magnitude = 3
            gs.notificaiton_format = 'EMAIL_HTML'
            gs.inspection_priority = insp_prio
            group.specs.append(gs)
            
        session.commit()
        Session.remove()
        
    def step03_addUsersToGroups(self):
        session = Session()
        add_users_to_groups(session=session)
        session.commit()
        Session.remove()
        
    def step04_geoJSON(self):
        '''
        Test run of geo_json
        '''
        data = geo_json()
        self.assertEqual(data['error'], '')
        
        # check if there are shakemaps
        shakemaps = session.query(ShakeMap).all()
        if not shakemaps:
            geo_json(query_period='week')
        
    def step05_createFacility(self):
        session = Session()
        sms = session.query(ShakeMap).all()
        if sms:
            for sm in sms:
                grid = create_grid(sm)
                f = create_fac(grid=grid)
                f.name = 'TEST FAC'
                session.add(f)
            session.commit()
        else:
            print '\nNo ShakeMaps to test facility processing'
    
    def step06_addFacsToGroups(self):
        session = Session()
        add_facs_to_groups(session=session)
        session.commit()
        Session.remove()
        
    def step07_checkNew(self):
        data = check_new()
        self.assertEqual(data['error'], '')
    
    def step08_checkEvents(self):
        session = Session()
        events = session.query(Event).all()
        for event in events:
            if event.status != 'processed':
                raise ValueError('Event not processed... {}: {}'.format(event.event_id,
                                                                        event.status))
            for notification in event.notifications:
                if notification.status != 'sent' and notification.status != 'aggregated':
                    raise ValueError('Notification not sent... {}: {}, {}'.format(event.event_id,
                                                                                  notification.notification_type,
                                                                                  notification.status))
                    
        Session.remove()
        
    def step09_checkShakeMaps(self):
        session = Session()
        shakemaps = session.query(ShakeMap).all()
        for shakemap in shakemaps:
            if shakemap.status != 'processed':
                raise ValueError('ShakeMap not processed... {}: {}'.format(shakemap.shakemap_id,
                                                                           shakemap.status))
            for notification in shakemap.notifications:
                if notification.status != 'sent' and notification.status != 'aggregated':
                    raise ValueError('Notification not sent... {}: {}, {}'.format(shakemap.shakemap_id,
                                                                                  notification.notification_type,
                                                                                  notification.status))
        Session.remove()
    
    def step10_geoJSON2(self):
        '''
        Second run of geo_json
        '''
        data = geo_json()
        self.assertEqual(data['error'], '')
        
        # check if there are shakemaps
        shakemaps = session.query(ShakeMap).all()
        if not shakemaps:
            geo_json(query_period='week')

    def step11_checkNew2(self):
        '''
        Check new a second time
        '''
        data = check_new()
        self.assertEqual(data['error'], '')

    def step12_notificationAssoc(self):
        '''
        Make sure events and notifications are linked
        '''
        session = Session()
        nots = session.query(Notification).all()
        bad_nots = [n for n in nots if n if n.event_id == None]

        self.assertEqual(len(bad_nots), 0)
        Session.remove()

    def step12_scenarioInDB(self):
        session = Session()
        sms = session.query(ShakeMap).all()
        if len(sms) > 0:
            sm = sms[-1]
            run_scenario(sm.shakemap_id[2:], sm.shakemap_id[:2])

        Session.remove()

    def step13_getScenarioWeb(self):
        pg = ProductGrabber()
        session = Session()
        sm = session.query(ShakeMap).first()

        Session.remove()

        if sm is not None:
            pg.get_scenario(shakemap_id=sm.shakemap_id)
        else:
            print 'No ShakeMap to grab for Scenario Test'
        
        
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
    def step1_clearData(self):
        '''
        Clear the user, group, and facility data from the test database
        '''
        session = Session()
        users = session.query(User).all()
        groups = session.query(Group).all()
        facs = session.query(Facility).all()
        
        [session.delete(user) for user in users]
        [session.delete(group) for group in groups]
        [session.delete(fac) for fac in facs]
        
        session.commit()
        Session.remove()
    
    def step2_userImport(self):
        user_file = os.path.join(sc_dir(), 'test', 'test_users.xml')
        file_type = determine_xml(user_file)
        import_user_xml(user_file)

        self.assertEqual(file_type, 'user')
        
    def step3_groupImport(self):
        group_file = os.path.join(sc_dir(), 'test', 'test_groups.xml')
        file_type = determine_xml(group_file)
        import_group_xml(group_file)

        self.assertEqual(file_type, 'group')
        
    def step4_facImport(self):
        fac_file = os.path.join(sc_dir(), 'test', 'test_facs.xml')
        file_type = determine_xml(fac_file)
        import_facility_xml(fac_file)

        self.assertEqual(file_type, 'facility')
    
    def step5_checkUser(self):
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
        
    def step6_checkGroup(self):
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
            elif group.name == 'CAL_BRIDGES':
                if len(group.users) != 2:
                    failed_str += '\nIncorrect number of users: {}, {}'.format(group.name,
                                                                               len(group.users))
                    failed = True
            elif group.name == 'CAL_BRIDGES_SCENARIO':
                if len(group.users) != 1:
                    failed_str += '\nIncorrect number of users: {}, {}'.format(group.name,
                                                                               len(group.users))
                    failed = True
        
        if failed is True:
            raise ValueError(failed_str)
        
        Session.remove()
        
    def step7_checkFacs(self):
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
                    
        if failed is True:
            raise ValueError(failed_str)
                    
        Session.remove()
        
    def step9_removeData(self):
        self.step1_clearData()
        
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
        self.assertEqual(sc.smtp_username, 'clear')
        self.assertEqual(sc.smtp_password, 'clear')
    
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
        
    def step4_SCRevert(self):
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
    lat_adjust = abs((grid.lat_max - grid.lat_min) / 10)
    lon_adjust = abs((grid.lon_max - grid.lon_min) / 10)
    if grid:
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

def create_user():
    """
    create a generic user for testing
    """
    get_user = session.query(User).filter(User.username=='USER_AUTO').all()
    
    if get_user:
        user = get_user[0]
    else:
        user = User()
        
    user.username = 'USER_AUTO'
    user.email = 'dslosky@usgs.gov'
    
    session.add(user)
    session.commit()
    
    return user

def create_group():
    """
    create a generic group for testing
    """
    get_group = session.query(Group).filter(Group.name=='GLOBAL_AUTO').all()
    
    if get_group:
        group = get_group[0]
    else:
        group = Group()
    
    group.name = 'GLOBAL_AUTO'
    group.lon_min = -180
    group.lon_max = 180
    group.lat_min = -90
    group.lat_max = 90
    
    facs = session.query(Facility).filter(Facility.in_grid(group)).all()
    group.facilities = facs
    
    # group specifications
    specs = ['New_Event', 'Update', 'Inspection']
    levels = ['green', 'yellow', 'orange', 'red']
    for spec in specs:
        if spec != 'Inspection':
            gs = Group_Specification()
            gs.group = group
            gs.notification_type = spec
        
        else:
            for level in levels:
                gs = Group_Specification()
                gs.group = group
                gs.notification_type = spec
                gs.inspection_priority = level
    
    session.merge(group)
    session.commit()
    
    return group
    
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
        