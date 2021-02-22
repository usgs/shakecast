from email.mime.text import MIMEText

from productdownload import ProductGrabber
from .notifications.notifications import Mailer
from orm import dbconnect, User

def url_test():
    pg = ProductGrabber()
    pg.get_json_feed()

@dbconnect
def db_test(session=None):
    u = User()
    u.username = 'SC_TEST_USER'
    session.add(u)
    session.commit()

    session.delete(u)
    session.commit()

def smtp_test():
    m = Mailer()
    you = m.me
    msg = MIMEText('This email is a test of your ShakeCast SMTP server')
    msg['Subject'] = 'ShakeCast SMTP TEST'
    msg['From'] = m.me
    msg['To'] = you
    m.send(msg=msg, you=you)

def system_test(add_tests=None, session=None):
    tests = [{'name': 'Access to USGS web', 'test': url_test}, 
             {'name': 'Database read/write', 'test': db_test},
             {'name': 'Sending test email', 'test': smtp_test}]

    # additional tests
    if add_tests is not None:
        tests += add_tests

    results = ''
    success_message = '{0}: Passed'
    failure_message = '{0}: Failed (Error - {1})'
    success = True
    for test in tests:
        try:
            test['test']()
            result = success_message.format(test['name'])
        except Exception as e:
            success = False
            result = failure_message.format(test['name'], str(e))
        
        if results:
            results += '\n{}'.format(result)
        else:
            results = result

    title = 'Tests Passed'
    if success is False:
        title = 'Some Tests Failed'
    
    data = {'status': 'finished',
            'results': results,
            'message': {'from': 'system_test',
                        'title': title,
                        'message': results,
                        'success': success},
            'log': 'System Test: ' + results}

    return data
