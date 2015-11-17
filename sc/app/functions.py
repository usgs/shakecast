import time
import math
import itertools
from dbi.db_alchemy import *
from objects import *
from helper_functions import *
import smtplib
from email.mime.text import MIMEText

def geo_json():
    pg = Product_Grabber()
    pg.get_json_feed()
    
    new_shakemaps, log_message = pg.get_new_events()
    
    if new_shakemaps:
        process_shakemaps(new_shakemaps)
        
    data = {'status': 'finished',
            'message': 'Check for new earthquakes',
            'log': log_message}
    
    return data
    
def process_shakemaps(shakemaps = []):
    
    for shakemap in shakemaps:   
        grid = create_grid(shakemap)
        groups_affected = session.query(Group).filter(Group.in_grid(grid)).all()
        
        # send out new events and create inspection notifications
        for group in groups_affected:
            # send off a new event message
            new_event_notification(shakemap=shakemap,
                                   group=group,
                                   grid=grid)
            
            notification = Notification(group=group,
                                        shakemap=shakemap,
                                        notification_type='Inspection',
                                        status='created')
            
            session.add(notification)
            session.commit()
        
        # make inspection priorities for affected facilities
        affected_facilities = set(itertools.chain.from_iterable([g.facilities
                                                                 for g in
                                                                 groups_affected]))
        for facility in affected_facilities:
            make_inspection_prios(facility=facility,
                                  shakemap=shakemap,
                                  grid=grid)
        
        session.commit()
            
        notifications = (session.query(Notification)
                            .filter(Notification.shakemap == shakemap)
                            .filter(Notification.notification_type == 'Inspection')
                            .all())
        
        [inspection_notification(notification=n,
                                 grid=grid) for n in notifications]
            
            
        session.add(shakemap)
        session.commit()
        
def make_inspection_prios(facility=Facility(),
                          shakemap=ShakeMap(),
                          grid=SM_Grid()):
    shaking_level = grid.max_shaking(facility=facility)
    fac_shaking = facility.make_alert_level(shaking_level=shaking_level,
                                            shakemap=shakemap)
    
    # process facility inspection states
    for group in facility.groups:
        notification = (session.query(Notification)
                            .filter(Notification.group == group)
                            .filter(Notification.shakemap == shakemap)
                            .filter(Notification.notification_type == 'Inspection')
                            .all())[0]
        
        notification.facility_shaking.append(fac_shaking)
    
def new_event_notification(shakemap=ShakeMap(),
                           grid=SM_Grid(),
                           group=Group()):
    
    notification = Notification(group=group,
                                shakemap=shakemap,
                                notification_type='New_Event',
                                status='created')
    
    session.add(notification)
    session.commit()
    
    notification.notification_file = notification.shakemap.directory_name + get_delim() + group.name + '_new_event.txt'
    not_file = open(notification.notification_file, 'w')
    
    preamble = ('There has been an earthquake and your ShakeCast instance is currently '
                'processing the information.')
    
    body = '''
    EQ: %s
    Version: %s
    Magnitude: %s
    Depth: %s KM
    Description: %s''' % (shakemap.shakemap_id,
                         shakemap.shakemap_version,
                         grid.magnitude,
                         grid.depth,
                         grid.description)
    
    not_file.write('%s \n %s' % (preamble, body))
    not_file.close()
    
    not_file = open(notification.notification_file, 'r')
    msg = MIMEText(not_file.read())
    not_file.close()
    
    me = 'ShakeCast@outlook.com'
    you = [user.email for user in group.users]
    
    msg['Subject'] = 'ShakeCast -- New Event'
    msg['To'] = ', '.join(you)
    msg['From'] = me
    
    server = smtplib.SMTP('smtp.live.com', 587) #port 465 or 587
    server.ehlo()
    server.starttls()
    server.ehlo()
    server.login(me, 'aaAA11!!')
    
    #s = smtplib.SMTP('localhost')
    server.sendmail(me, you, msg.as_string())
    server.quit()
    
    notification.status = 'sent'

    
def inspection_notification(notification=Notification(),
                            grid=SM_Grid()):
    
    shakemap = notification.shakemap
    group = notification.group
    
    notification.notification_file = ('%s%s%s_Inspection.txt' %
                                        (shakemap.directory_name,
                                         get_delim(),
                                         group.name))
    
    not_file = open(notification.notification_file, 'w')
    
    preamble = ('ShakeCast has processed your facilities...')
    
    body = '''
    EQ: %s
    Version: %s
    Magnitude: %s
    Depth: %s KM
    Description: %s
    
    ''' % (shakemap.shakemap_id,
           shakemap.shakemap_version,
           grid.magnitude,
           grid.depth,
           grid.description)
    
    fac_header = '%s%s%s%s%s%s%s' % ('Facility_ID',
                                    (' ' * (15 - len('Facility_ID'))),
                                    'Facility_Name',
                                    (' ' * (30 - len('Facility_Name'))),
                                    'Facility_Type',
                                    (' ' * (20 - len('Facility_Type'))),
                                    'Alert_Level')

    fac_str = '\n'.join(['%s%s%s%s%s%s%s' % (fs.facility.facility_id,
                                    ' ' * (15 - len(fs.facility.facility_id)),
                                    fs.facility.name,
                                    ' ' * (30 - len(fs.facility.name)),
                                    fs.facility.facility_type,
                                    ' ' * (20 - len(fs.facility.facility_type)),
                                    fs.alert_level
                                   ) for fs in notification.facility_shaking])
    
    body += '%s\n%s' % (fac_header, fac_str)
    
    not_file.write('%s \n %s' % (preamble, body))
    not_file.close()
    
    not_file = open(notification.notification_file, 'r')
    msg = MIMEText(not_file.read())
    not_file.close()
    
    me = 'ShakeCast@outlook.com'
    you = [user.email for user in notification.group.users]
    
    msg['Subject'] = 'ShakeCast -- Inspection'
    msg['To'] = ', '.join(you)
    msg['From'] = me
    
    server = smtplib.SMTP('smtp.live.com', 587) #port 465 or 587
    server.ehlo()
    server.starttls()
    server.ehlo()
    server.login(me, 'aaAA11!!')
    
    #s = smtplib.SMTP('localhost')
    server.sendmail(me, you, msg.as_string())
    server.quit()
    
    notification.status = 'sent'
    
    session.add(notification)
    session.commit()

    
def send_notification(notification=None):
    template = notification.group.template
    emails = [user.email for user in notification.group.users]
            
#######################################################################
########################## Manual Testing #############################

def create_fac(grid=None, fac_id='AUTO_GENERATED'):
    '''
    Create a facility that is inside of a grid with generic fragility
    '''
    
    facility = Facility()
    if grid:
        facility.lat_min = grid.lat_min + 1
        facility.lat_max = grid.lat_max - 1
        facility.lon_min = grid.lon_min + 1
        facility.lon_max = grid.lon_max - 1
    
    facility.facility_id = fac_id   
    facility.metric = 'MMI'
    facility.grey = 0
    facility.green = 3
    facility.yellow = 5
    facility.orange = 6
    facility.red = 7
    facility.grey_alpha = .64
    facility.green_alpha = .64
    facility.yellow_alpha = .64
    facility.orange_alpha = .64
    facility.red_alpha = .64
    
    return facility

def create_grid(shakemap=None):
    grid = SM_Grid()
    grid.load(shakemap.directory_name + get_delim() + 'grid.xml')
    
    return grid

def create_user():
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
    get_group = session.query(Group).filter(Group.name=='GLOBAL_AUTO').all()
    
    if get_group:
        group = get_group[0]
    else:
        group = Group()
    
    group.name = 'GLOBAL_AUTO'
    group.lon_min = -179
    group.lon_max = 179
    group.lat_min = -179
    group.lat_max = 179
    
    facs = session.query(Facility).filter(Facility.in_grid(group)).all()
    group.facilities = facs
    
    session.add(group)
    session.commit()
    
    return group

def check_nots():
    while True:
        nots = session.query(Notification).filter(Notification.notification_type == 'Inspection').all()
        for n in nots:
            print 'ID: %s \nSHAKING: %s' % (n.shakecast_id, n.facility_shaking)
            time.sleep(1)
            os.system('cls' if os.name == 'nt' else 'clear')
        session.commit()
        
    

########################## SERVER TESTING #############################
# functions used to test server
def loop1():
    print 'LOOP1'
    #dispatcher.send('to-server', task_name='loop1', data={'mydata': 'here it is!'})
    data={'status': 'finished', 'message': 'here it is, loop1!'}
    return data
def loop2():
    print 'LOOP2'
    #dispatcher.send('to-server', task_name='loop2', data={'mydata': 'here it is!'})
    data={'status': 'finished', 'message': 'here it is, loop2!'}
    return data

def long():
    for i in xrange(100):
        print i
        time.sleep(1)
    data={'status': 'finished',
          'message': 'Looped through 100 numbers! One second at a time!!'}
    return data

def short():
    for i in xrange(10):
        print i
        time.sleep(1)
    data={'status': 'finished',
          'message': 'Looped through 10 numbers! One second at a time!!'}
    return data


def manual(to_print=""):
    print 'Manual: %s' % to_print
    
    data={'status': 'finished', 'message': 'printed: %s' % to_print}
    return data
    
def my_print(to_print=""):
    print 'my_print'
    print 'Printing: %s' % to_print
    #dispatcher.send('to-server', task_name='my_print', data={'mydata': 'here it is!'})
    data={'status': 'finished', 'message': 'here it is!, manual!'}
    return data

def ins_random(count=10):
    dl = db.Data_Layer()
    count = int(count)
    
    for i in range(count):
        dl.query("INSERT INTO data (num, val) VALUES ('" + str(i) + "', 'aaSDasd');")

    # Uncomment the line below to mess with connections blocking
    # eachother
    #time.sleep(2)

    dl.close()
    
    return_str = 'Created ' + str(count) + ' new records'
    
    data={'status': 'finished', 'message': return_str}
    return data

#######################################################################




#######################################################################
########################## TEST FUNCTIONS #############################
def task_test():
    return {'status': 'finished', 'message': 'Success'}

def job_fail_test():
    return {'status': 'failed', 'message': 'Success'}



