import unittest
import os
import sys
from email.mime.text import MIMEText
import time

path = os.path.dirname(os.path.abspath(__file__)).split(os.sep)
del path[-1]
path = os.sep.join(path) + os.sep
if path not in sys.path:
    sys.path += [path]
from app.functions import *

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
        
        admin_send = ''
        while admin_send != 'y' and admin_send != 'n':
            admin_send = raw_input('\nSend email test to admin? (y/n): ')
        
        if admin_send == 'y':
            session = Session()
            users = session.query(User).filter(User.user_type.like('admin')).all()
            you = ', '.join([user.email for user in users])
            Session.remove()
        else:
            you = 'test@test.com'
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
        
        
        
if __name__ == '__main__':
    unittest.main()
        