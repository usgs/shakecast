import unittest
import os
import sys
from email.mime.text import MIMEText
import time
import pdb
path = os.path.dirname(os.path.abspath(__file__)).split(os.sep)
del path[-1]
path = os.sep.join(path) + os.sep
if path not in sys.path:
    sys.path += [path]
from app.functions import *
from app.task import Task

class TestProductGrabber(unittest.TestCase):
    '''
    Test functions for the Product_Grabber class
    '''
    def test_initProductGrabber(self):
        '''
        Test product grabber initialization
        Fails when there is an error in the code
        '''
        pg = Product_Grabber()
        
    def test_getJSONFeed(self):
        '''
        Tests access to the USGS JSON feed. Failure points to error in
        code, lack of internet access, or a down USGS server
        '''
        pg = Product_Grabber()
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
    def step1_createUser(self):
        session = Session()
        user = User()
        user.username = 'test_user'
        user.email = self.email
        user.user_type = 'ADMIN'
        user.group_string = 'GLOBAL'
        session.add(user)
        session.commit()
        Session.remove()
        
    def step2_createGroup(self):
        session = Session()
        group = Group()
        group.name = 'GLOBAL'
        group.facility_type = 'All'
        group.lon_min = -179.99
        group.lon_max = 179.99
        group.lat_min = -89.99
        group.lat_max = 89.99
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
        
    def step3_addUsersToGroups(self):
        session = Session()
        add_users_to_groups(session=session)
        session.commit()
        Session.remove()
        
    def step4_geoJSON(self):
        '''
        Test run of geo_json
        '''
        data = geo_json()
        self.assertEqual(data['error'], '')
        
    def step5_createFacility(self):
        session = Session()
        sm = session.query(ShakeMap).first()
        if sm:
            grid = create_grid(sm)
            f = create_fac(grid=grid)
            f.name = 'TEST FAC'
            session.add(f)
            session.commit()
        else:
            print '\nNo ShakeMaps to test facility processing'
    
    def step6_addFacsToGroups(self):
        session = Session()
        add_facs_to_groups(session=session)
        session.commit()
        Session.remove()
        
    def step7_checkNew(self):
        data = check_new()
        self.assertEqual(data['error'], '')
    
    def step8_checkEvents(self):
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
        
    def step9_checkShakeMaps(self):
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
        import_user_xml('test_users.xml')
        
    def step3_groupImport(self):
        import_group_xml('test_groups.xml')
        
    def step4_facImport(self):
        import_facility_xml('test_facs.xml')
    
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
        

def cg():
    session = Session()
    group = Group()
    group.name = 'GLOBAL'
    group.facility_type = 'All'
    group.lon_min = -179.99
    group.lon_max = 179.99
    group.lat_min = -89.99
    group.lat_max = 89.99
    session.add(group)
    
    gs = Group_Specification()
    gs.notification_type = 'NEW_EVENT'
    gs.minimum_magnitude = 3
    gs.notificaiton_format = 'EMAIL_HTML'
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
    
def cu():
    session = Session()
    user = User()
    user.username = 'test_user'
    user.email = 'test@test.com'
    user.user_type = 'ADMIN'
    user.group_string = 'GLOBAL'
    session.add(user)
    session.commit()
    Session.remove()
    
if __name__ == '__main__':
    
    # If the user wants to make sure they can get emails, they should
    # be able to specify an email address for each test run
    email_query = ''
    while email_query != 'y' and email_query != 'n':
        email_query = raw_input('\nEnter email address for testing? (y/n): ')
    if email_query == 'y':
        unittest.TestCase.email = raw_input('\nEnter email address: ')
    else:
        unittest.TestCase.email = 'test@test.com'
    
    unittest.main()
        