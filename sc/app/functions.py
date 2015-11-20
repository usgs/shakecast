import time
import math
import itertools
from dbi.db_alchemy import *
from objects import *
from helper_functions import *
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
            old_sms = (session.query(ShakeMap)
                        .filter(ShakeMap.shakemap_id == shakemap.shakemap_id)
                        .all())
            
            # send off a new event message
            if (group.has_spec(not_type='New_Event') and
                    (shakemap.shakemap_version == 1 or not old_sms)):
                new_event_notification(shakemap=shakemap,
                                       group=group,
                                       grid=grid)
            
            # send updated event message
            elif group.has_spec(not_type='Update') and shakemap.shakemap_version > 1:
                new_event_notification(shakemap=shakemap,
                                       group=group,
                                       grid=grid,
                                       update=True)
                
            # create an inspection notification
            if group.has_spec(not_type='Inspection'):
                notification = Notification(group=group,
                                            shakemap=shakemap,
                                            notification_type='Inspection',
                                            status='created')
                
                session.add(notification)
        session.commit()
        
        notifications = (session.query(Notification)
                    .filter(Notification.shakemap == shakemap)
                    .filter(Notification.notification_type == 'Inspection')
                    .filter(Notification.status != 'sent')
                    .all())
        
        if notifications:
        #if group.has_spec(not_type='Inspection'):
            # make inspection priorities for affected facilities
            affected_facilities = set(itertools.chain.from_iterable([g.facilities
                                                                     for g in
                                                                     groups_affected]))
            for facility in affected_facilities:
                # add new shaking information to the session
                make_inspection_prios(facility=facility,
                                      shakemap=shakemap,
                                      grid=grid)
            
            # save new shaking information in the database
            session.commit()
                

            
            [inspection_notification(notification=n,
                                     grid=grid) for n in notifications]
                
                
            session.add(shakemap)
            session.commit()
        
def make_inspection_prios(facility=Facility(),
                          shakemap=ShakeMap(),
                          grid=SM_Grid()):
    facility_shaking = grid.max_shaking(facility=facility)
    shaking_level = facility_shaking[facility.metric]
    
    fac_shaking = facility.make_alert_level(shaking_level=shaking_level,
                                            shakemap=shakemap)
    
    # process facility inspection states
    for group in facility.groups:
        notification = (session.query(Notification)
                            .filter(Notification.group == group)
                            .filter(Notification.shakemap == shakemap)
                            .filter(Notification.notification_type == 'Inspection')
                            .filter(Notification.status != 'sent')
                            .first())
        
        notification.facility_shaking.append(fac_shaking)
    
def new_event_notification(shakemap=ShakeMap(),
                           grid=SM_Grid(),
                           group=Group(),
                           update=False):
    
    notification = Notification(group=group,
                                shakemap=shakemap,
                                notification_type='New_Event',
                                status='created')
    
    session.add(notification)
    session.commit()
    
    try:
        notification.notification_file = notification.shakemap.directory_name + get_delim() + group.name + '_new_event.txt'
        not_file = open(notification.notification_file, 'w')
        
        if update is True:
            preamble = '''A previous ShakeMap has been updated. Depending on your notification group
specifications, your ShakeCast instance may be processing a new inspection
priority message.'''
        else:
            preamble = '''There has been an earthquake and your ShakeCast instance is currently
processing the information.'''
        
        preamble += '\nYou are receiving this message as part of the %s notification group.' % group.name
        
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
        notification.status = 'file success'
    except:
        notification.status = 'file failed'
    
    if notification.status != 'file failed':
        try:
            not_file = open(notification.notification_file, 'r')
            msg = MIMEText(not_file.read())
            not_file.close()

            mailer = Mailer()
            
            me = mailer.me
            you = [user.email for user in group.users]
            
            if update is False:
                msg['Subject'] = 'ShakeCast -- New Event'
            else:
                msg['Subject'] = 'ShakeCast -- Update'
                
            msg['To'] = ', '.join(you)
            msg['From'] = me
            
            mailer.send(msg=msg, you=you)
            
            notification.status = 'sent'
        except:
            notification.status = 'send failed'
    
def inspection_notification(notification=Notification(),
                            grid=SM_Grid()):
    
    shakemap = notification.shakemap
    group = notification.group
    
    notification.notification_file = ('%s%s%s_Inspection.txt' %
                                        (shakemap.directory_name,
                                         get_delim(),
                                         group.name))

    try:
        not_file = open(notification.notification_file, 'w')
        
        preamble = '''
ShakeCast has processed your facilities. You are recieving this notification
because you are a part of the %s notification group
                   ''' % group.name
        
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
        notification.status = 'file success'
    except:
        notification.status = 'file failed'
    
    if notification.status != 'file failed':
        try:
            not_file = open(notification.notification_file, 'r')
            msg = MIMEText(not_file.read())
            not_file.close()
            mailer = Mailer()
            
            me = mailer.me
            you = [user.email for user in notification.group.users]
            
            msg['Subject'] = 'ShakeCast -- Inspection'
            msg['To'] = ', '.join(you)
            msg['From'] = me
            
            
            mailer.send(msg=msg, you=you)
            
            notification.status = 'sent'
        except:
            notification.status = 'send failed'
            
    session.add(notification)
    session.commit()

    
def send_notifications():
    '''
    Resend notifications that failed for some reason before
    '''
    notifications = (session.query(Notification)
                        .filter(Notification.status != 'sent')
                        .all())
    
    shakemaps = [n.shakemap for n in notifications]
    process_shakemaps(shakemaps)
    
def import_facility_xml(xml_file=None):
    pass

            
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
    facility.facility_type = 'Bridge'
    facility.name = 'No Name'
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



