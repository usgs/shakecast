import time
import math
import itertools
from dbi.db_alchemy import *
from objects import *
from functions_util import *
import xml.etree.ElementTree as ET
from email.mime.text import MIMEText
import re

def geo_json():
    '''
    Get earthquake feed from USGS and check for new earthquakes
    '''
    
    try:
        pg = Product_Grabber()
        pg.get_json_feed()
    
        new_shakemaps, log_message = pg.get_new_events()
        
    except:
        log_message = 'Failed to download ShakeMap products: Check internet connection and firewall settings'
        
    data = {'status': 'finished',
            'message': 'Check for new earthquakes',
            'log': log_message}
    
    return data

def check_new_shakemaps():
    '''
    Search database for unprocessed shakemaps
    '''
    
    # for debugging
    #import pdb
    #pdb.set_trace()
    
    log_message = ''
    try:
        Local_Session = scoped_session(Session)
        session = Local_Session()
        new_shakemaps = (session.query(ShakeMap)
                                .filter(ShakeMap.status=='new')
                                .all())
        
    except:
        log_message += 'failed to access database'
        
    try:
        if new_shakemaps:
            process_shakemaps(new_shakemaps, session=session)
            log_message += 'Processed ShakeMaps: '
        else:
            log_message += 'No new shakemaps'
    
        Local_Session.remove()
    except:
        log_message += 'failed to process new shakemaps: '

    data = {'status': 'finished',
            'message': 'Check for new earthquakes',
            'log': log_message}
    
    return data
    
def process_shakemaps(shakemaps=[], session=None):
    '''
    Process or reprocess the shakemaps passed into the function
    '''
    
    db_conn = engine.connect()
    for shakemap in shakemaps:
        shakemap.status = 'processing_started'
        
        # open the grid.xml file and find groups affected by event
        grid = create_grid(shakemap)
        groups_affected = (session.query(Group)
                                    .filter(Group.in_grid(grid))
                                    .all())
        
        if not groups_affected:
            shakemap.status = 'no groups'
            session.commit()
            continue
        
        # send out new events and create inspection notifications
        for group in groups_affected:
            old_sms = (session.query(ShakeMap)
                        .filter(ShakeMap.shakemap_id == shakemap.shakemap_id)
                        .all())
            
            # send off a new event message
            new_event = False
            if (group.has_spec(not_type='NEW_EVENT') and
                    (shakemap.shakemap_version == 1 or not old_sms)):
                
                notification = Notification(group=group,
                                shakemap=shakemap,
                                notification_type='NEW_EVENT',
                                status='created')
    
                session.add(notification)
                
                new_event_notification(shakemap=shakemap,
                                       group=group,
                                       grid=grid,
                                       notification=notification)
                
                new_event = True
            # send updated event message
            elif group.has_spec(not_type='Update') and shakemap.shakemap_version > 1:
                
                notification = Notification(group=group,
                                shakemap=shakemap,
                                notification_type='Update',
                                status='created')
                session.add(notification)
                
                new_event_notification(shakemap=shakemap,
                                       group=group,
                                       grid=grid,
                                       update=True,
                                       notification=notification)  
            session.commit()    
                
            # create an inspection notification
            if group.has_spec(not_type='DAMAGE'):
                
                # Check if the group gets notification for updates
                if new_event is False:
                    specs = [spec for spec in group.specs if spec.event_type == 'UPDATE']
                    if not specs:
                        shakemap.status = 'update -- no notification'
                        continue
                    
                notification = Notification(group=group,
                                            shakemap=shakemap,
                                            notification_type='DAMAGE',
                                            status='created')
                
                session.add(notification)
        session.commit()
        
        notifications = (session.query(Notification)
                    .filter(Notification.shakemap == shakemap)
                    .filter(Notification.notification_type == 'DAMAGE')
                    .filter(Notification.status != 'sent')
                    .all())
        
        if notifications:
        #if group.has_spec(not_type='Inspection'):
            # get a set of all affected facilities
            affected_facilities = set(itertools
                                        .chain
                                        .from_iterable(
                                            [(session.query(Facility)
                                                .filter(Facility.in_grid(grid))
                                                .filter(Facility.groups
                                                            .any(Group.shakecast_id == group.shakecast_id))
                                                .all())
                                             for g in
                                             groups_affected]))
            
            # find the largest shaking id
            shaking_id = (session
                            .query(Facility_Shaking.shakecast_id,
                                   func.max(Facility_Shaking.shakecast_id))
                                .first()[0])
            if shaking_id:
                shaking_id += 1
            else:
                shaking_id = 1
                
            fac_shaking_lst = [{}] * len(affected_facilities)
            relationships = [{}] * (len(affected_facilities) * len(notifications))
            f_count = 0
            r_count = 0
            for facility in affected_facilities:
                fac_shaking = make_inspection_prios(facility=facility,
                                                    shakemap=shakemap,
                                                    grid=grid,
                                                    notifications=notifications)
                if not fac_shaking['update']:
                    fac_shaking['_shakecast_id'] = shaking_id
                    shaking_id += 1
                
                fac_shaking_lst[f_count] = fac_shaking
                
                for n in fac_shaking['notifications']:
                    if n:
                        relationships[r_count] = {'notification': n.shakecast_id,
                                                  'facility_shaking': fac_shaking['_shakecast_id']}
                        r_count += 1
                
                
                f_count += 1
            
            # get rid of empty dictionaries in relationships
            relationships = filter(None, relationships)
                
            # create a statement to insert fac_shaking_list into database
            stmt = (Facility_Shaking.__table__.insert()
                        .values(grey=bindparam('grey'),
                                green=bindparam('green'),
                                yellow=bindparam('yellow'),
                                orange=bindparam('orange'),
                                red=bindparam('red'),
                                alert_level=bindparam('alert_level'),
                                weight=bindparam('weight'),
                                facility_id=bindparam('facility_id'),
                                shakemap_id=bindparam('shakemap_id'),
                                metric=bindparam('metric'),
                                shakecast_id=bindparam('_shakecast_id')
                                ))
            
            # create a seperate statement containing the relationships
            # of these shaking levels with their facilities
            rel_stmt = (shaking_notification_connection.insert()
                            .values(notification=bindparam('notification'),
                                    facility_shaking=bindparam('facility_shaking')))
            
            #sqlite specific adjustment to overwrite existing records
            stmt = str(stmt).replace('INSERT', 'INSERT OR REPLACE')
            rel_stmt = str(rel_stmt).replace('INSERT', 'INSERT OR REPLACE')
            
            # if there are facilities affected, send shaking data to
            # database
            if fac_shaking_lst:
                db_conn.execute(stmt, fac_shaking_lst)
            # quick check for relationships before inserting into
            # database in order to avoid errors in strange
            # circumstances... probably not necessary
            if relationships:
                db_conn.execute(rel_stmt, relationships)
            session.commit()
            
            # send inspection notifications for the shaking levels we
            # just computed
            [inspection_notification(notification=n,
                                     grid=grid) for n in notifications]
                
            shakemap.status = 'processed'    
            session.commit()
        
def make_inspection_prios(facility=Facility(),
                          shakemap=ShakeMap(),
                          grid=SM_Grid(),
                          notifications=[]):
    '''
    Determines inspection priorities for the input facility
    '''
    
    # get the largest shaking level affecting the facility
    facility_shaking = grid.max_shaking(facility=facility)
    if facility_shaking is not None:
        shaking_level = facility_shaking[facility.metric]
    else:
        shaking_level = 0
    
    # use the max shaking value to create fragility curves for the
    # damage states
    fac_shaking = facility.make_alert_level(shaking_level=shaking_level,
                                            shakemap=shakemap,
                                            notifications=notifications)
    return fac_shaking
    
def new_event_notification(shakemap=ShakeMap(),
                           grid=SM_Grid(),
                           group=Group(),
                           update=False,
                           notification=None):
    
    try:
        notification.notification_file = '%s%s%s_new_event.txt' % ((notification
                                                                    .shakemap
                                                                    .directory_name),
                                                                   get_delim(),
                                                                   group.name)
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
    '''
    Using an existing notificaiton and shakemap grid, create an email
    notification and send it: inspection notification
    '''
    
    db_conn = engine.connect()
    shakemap = notification.shakemap
    group = notification.group
    
    # save the file location for this notification
    notification.notification_file = ('%s%s%s_Inspection.txt' %
                                        (shakemap.directory_name,
                                         get_delim(),
                                         group.name))

    try:
        # open the notification file and write the preamble and
        # heading information
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
        
        # get necessary shaking info from database
        stmt = (select([Facility.__table__.c.facility_id,
                       Facility.__table__.c.name,
                       Facility.__table__.c.facility_type,
                       Facility_Shaking.__table__.c.alert_level
                       ]).where(and_(Facility_Shaking.__table__.c.facility_id ==
                                        Facility.__table__.c.shakecast_id,
                                        Facility_Shaking.__table__.c.shakemap_id ==
                                        shakemap.shakecast_id))
                         .order_by(desc('weight')))
        result = db_conn.execute(stmt)
        
        # create a string that includes the shaking information queried
        # above
        fac_str = '\n'.join(['%s%s%s%s%s%s%s' % (row[0],
                                        ' ' * (15 - len(str(row[0]))),
                                        row[1],
                                        ' ' * (30 - len(str(row[1]))),
                                        row[2],
                                        ' ' * (20 - len(str(row[2]))),
                                        row[3]
                                       ) for row in result])
        
        # add shaking information to the header string to create the
        # body of the notification
        body += '%s\n%s' % (fac_header, fac_str)
        # write both the preamble and body to the file
        not_file.write('%s \n %s' % (preamble, body))
        
        not_file.close()
        notification.status = 'file success'
    except:
        notification.status = 'file failed'
    
    # if the file was created successfully, try sending it
    if notification.status != 'file failed':
        try:
            # open notification file and write its contents into MIME
            # text for the email server
            not_file = open(notification.notification_file, 'r')
            msg = MIMEText(not_file.read())
            not_file.close()
            
            # create a mailer object and determine who is sending and
            # receiving these notifications
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

def send_notifications():
    '''
    Resend notifications that failed for some reason before
    '''
    notifications = (session.query(Notification)
                        .filter(Notification.status != 'sent')
                        .all())
    
    shakemaps = set([n.shakemap for n in notifications])
    process_shakemaps(shakemaps)
    

#######################################################################
############################## Scenarios ##############################
def run_scenario(eq='', version=0):
    '''
    Have pyCast process a specific event, submitted by a user
    '''
    
    session = Local_Session()
    # check in db
    if version:
        shakemap = session.query(ShakeMap).filter(and_(ShakeMap.shakemap_id == eq,
                                                       ShakeMap.shakemap_version == version)).first()
    else:
        shakemap = session.query(ShakeMap).filter(ShakeMap.shakemap_id == eq).first()
        
    if shakemap:
        process_shakemaps([shakemap])
        
    else:
        # check for file
        pass
    
    # get files from web
    
    Local_Session.remove()


#######################################################################
######################## Import Inventory Data ########################

def import_facility_xml(xml_file=''):
    '''
    Import an XML file created by the ShakeCast workbook; Facilities
    '''
    Local_Session = scoped_session(Session)
    session = Local_Session()
    
    groups = session.query(Group).all()
    
    tree = ET.parse(xml_file)
    root = tree.getroot()
    facs = [child for child in root]
    for fac in facs:
        facility_id = ''
        facility_type = ''
        component = ''
        component_class = ''
        name = ''
        description = ''
        short_name = ''
        model = ''
        geom_type = ''
        html = ''
        geom = ''
        grey = -1
        grey_beta = -1
        grey_metric = ''
        green = -1
        green_beta = -1
        green_metric = ''
        yellow = -1
        yellow_beta = -1
        yellow_metric = ''
        orange = -1
        orange_beta = -1
        orange_metric = ''
        red = -1
        red_beta = -1
        red_metric = ''
        
        for child in fac:
            if child.tag == 'EXTERNAL_FACILITY_ID':
                facility_id = child.text
            elif child.tag == 'FACILITY_TYPE':
                facility_type = child.text
            elif child.tag == 'COMPONENT_CLASS':
                component_class = child.text
            elif child.tag == 'COMPONENT':
                component = child.text
            elif child.tag == 'FACILITY_NAME':
                name = child.text
            elif child.tag == 'DESCRIPTION':
                description = child.text
            elif child.tag == 'SHORT_NAME':
                pass
            elif child.tag == 'FACILITY_MODEL':
                model = child.text
            elif child.tag == 'FEATURE':
                for child2 in child:
                    if child2.tag == 'GEOM_TYPE':
                        geom_type = child2.text
                    elif child2.tag == 'DESCRIPTION':
                        html = child2.text
                    elif child2.tag == 'GEOM':
                        geom = child2.text
            elif child.tag == 'FRAGILITY':
                for child2 in child:
                    for child3 in child2:
                        if child2.tag == 'GREY':
                            if child3.tag == 'METRIC':
                                grey_metric = child3.text
                            elif child3.tag == 'ALPHA':
                                grey = float(child3.text)
                            elif child3.tag == 'BETA':
                                grey_beta = float(child3.text)
                        elif child2.tag == 'GREEN':
                            if child3.tag == 'METRIC':
                                green_metric = child3.text
                            elif child3.tag == 'ALPHA':
                                green = float(child3.text)
                            elif child3.tag == 'BETA':
                                green_beta = float(child3.text)
                        elif child2.tag == 'YELLOW':
                            if child3.tag == 'METRIC':
                                yellow_metric = child3.text
                            elif child3.tag == 'ALPHA':
                                yellow = float(child3.text)
                            elif child3.tag == 'BETA':
                                yellow_beta = float(child3.text)
                        elif child2.tag == 'ORANGE':
                            if child3.tag == 'METRIC':
                                orange_metric = child3.text
                            elif child3.tag == 'ALPHA':
                                orange = float(child3.text)
                            elif child3.tag == 'BETA':
                                orange_beta = float(child3.text)
                        elif child2.tag == 'RED':
                            if child3.tag == 'METRIC':
                                red_metric = child3.text
                                
                                # temporarily add metric
                                metric = child3.text
    
                            elif child3.tag == 'ALPHA':
                                red = float(child3.text)
                            elif child3.tag == 'BETA':
                                red_beta = float(child3.text)
        
        # check for an existing facility with this ID
        existing = (session.query(Facility)
                            .filter(Facility.facility_id == facility_id)
                            .filter(Facility.component == component)
                            .filter(Facility.component_class == component_class)
                            .all())
        if existing:
            [session.delete(f) for f in existing]
            
        # determine if we can add to session or not
        if not facility_id:
            # don't add to session and add to error message
            continue
        if not component:
            component = 'system'
        if not component_class:
            component_class = 'system'
        
        # Create facility
        f = Facility()
        
        f.facility_id = facility_id
        f.facility_type = facility_type
        f.component = component
        f.component_class = component_class
        f.name = name
        f.description = description
        f.short_name = short_name
        f.model = model
        f.geom_type = geom_type
        f.html = html
        f.geom = geom
        f.grey = grey
        f.grey_beta = grey_beta
        f.grey_metric = grey_metric
        f.green = green
        f.green_beta = green_beta
        f.green_metric = green_metric
        f.yellow = yellow
        f.yellow_beta = yellow_beta
        f.yellow_metric = yellow_metric
        f.orange = orange
        f.orange_beta = orange_beta
        f.orange_metric = orange_metric
        f.red = red
        f.red_beta = red_beta
        f.red_metric = red_metric
        f.metric = metric
        
        if geom_type and geom:
            # manipulate geometry
            if geom_type == 'POINT':
                point = geom.split(',')
                lon = float(point[0])
                lat = float(point[1])
                elev = float(point[2])
                
                f.lon_min = lon - .01
                f.lon_max = lon + .01
                f.lat_min = lat - .01
                f.lat_max = lat + .01
                
            elif geom_type == 'POLYGON':
                points = geom.split(';').split(',')
                lons = [pnt[0] for pnt in points]
                lats = [pnt[1] for pnt in points]
                elevs = [pnt[2] for pnt in points]
                
                f.lon_min = min(lons)
                f.lon_max = max(lons)
                f.lat_min = min(lats)
                f.lat_max = max(lats)
                
            elif geom_type == 'POLYLINE':
                pass
            
        session.add(f)
    add_facs_to_groups(session=session)
    session.commit()
    
    Local_Session.remove()
    
    log_message = ''
    status = 'finished'
    data = {'status': status,
            'message': 'Imported Facilities',
            'log': log_message}
    
    return data
    
def import_group_xml(xml_file=''):
    '''
    Import an XML file created by the ShakeCast workbook; Groups
    '''
    
    Local_Session = scoped_session(Session)
    session = Local_Session()
    
    tree = ET.parse(xml_file)
    root = tree.getroot()
    groups = [child for child in root]
    
    for group in groups:
        name = ''
        facility_type = ''
        lon_min = 0
        lon_max = 0
        lat_min = 0
        lat_max = 0
        notification_type = ''
        inspection_priority = ''
        minimum_magnitude = 0
        notification_format = ''
        aggregate_name = 'Default'
        damage_level = ''
        template = ''
        poly = ''
        
        for child in group:
            if child.tag == 'GROUP_NAME':
                name = child.text
            elif child.tag == 'FACILITY_TYPE':
                facility_type = child.text
            elif child.tag == 'POLY':
                poly = child.text
        
        # split up the monitoring region
        split_poly = re.split('\s|;|,', poly)
        split_poly = filter(None, split_poly)
        
        # try to get the group
        g = session.query(Group).filter(Group.name == name).all()
        if g:
            g = g[0]
        else:
            g = Group()
            g.name = name
            
            # check requirements for group and exit if not met
            if (name == '' or
                    len(split_poly) % 2 != 0 or
                    len(split_poly) < 6):
                continue
        
            session.add(g)
        
        g.facility_type = facility_type
        
        # split up the poly and save lat/lon min/max if the monitoring
        # region is being updated
        if split_poly:
            lats = []
            lons = []
            for num, lat_lon in enumerate(split_poly):
                if num % 2 == 0:
                    lats += [float(lat_lon)]
                else:
                    lons += [float(lat_lon)]
                    
            g.lat_min = min(lats)
            g.lat_max = max(lats)
            g.lon_min = min(lons)
            g.lon_max = max(lons)
        
        for child in group:
            if child.tag == 'NOTIFICATION':
                for child2 in child:
                    if child2.tag == 'NOTIFICATION_TYPE':
                        notification_type = child2.text
                    elif child2.tag == 'LIMIT_VALUE':
                        minimum_magnitude = child2.text
                    elif child2.tag == 'EVENT_TYPE':
                        event_type = child2.text
                    elif child2.tag == 'DELIVERY_METHOD':
                        notification_format = child2.text
                    elif child2.tag == 'AGGREGATE_GROUP':
                        aggregate_name = child2.text
                    elif child2.tag == 'DAMAGE_LEVEL':
                        damage_level = child2.text
            
                # Check requirements for group specification
                
                # look for existing spec
                if notification_type == 'NEW_EVENT':
                    spec = (session.query(Group_Specification)
                                .filter(Group_Specification.notification_type == notification_type)
                                .filter(Group_Specification.group == g)).all()
                else:
                    spec = (session.query(Group_Specification)
                                .filter(Group_Specification.notification_type == notification_type)
                                .filter(Group_Specification.inspection_priority == damage_level)
                                .filter(Group_Specification.group == g)).all()
                if spec:
                    spec = spec[0]

                else:
                    spec = Group_Specification()
                    spec.notification_type = notification_type
                    if damage_level:
                        spec.damage_level= damage_level
                        
                    g.specs += [spec]
                
                if damage_level:    
                    spec.inspection_priority = damage_level
                         
                spec.minimum_magnitude = minimum_magnitude
                spec.notification_format = notification_format
                spec.aggregate_group = aggregate_name
    
    add_facs_to_groups(session=session)
    add_users_to_groups(session=session)
    session.commit()
    Local_Session.remove()
    
    log_message = ''
    status = 'finished'
    data = {'status': status,
            'message': 'Imported Groups',
            'log': log_message}
    
    return data

def import_user_xml(xml_file=''):
    '''
    Import an XML file created by the ShakeCast workbook; Users
    '''
    
    Local_Session = scoped_session(Session)
    session = Local_Session()
    
    tree = ET.parse(xml_file)
    root = tree.getroot()
    users = [child for child in root]
    
    for user in users:
        username = None
        password = None
        user_type = 'USER'
        full_name = None
        phone_number = ''
        email = ''
        email_text = ''
        email_html = ''
        email_pager = ''
        group_lst = []
        group_string = ''
        
        for child in user:
            if child.tag == 'USERNAME':
                username = child.text
            elif child.tag == 'PASSWORD':
                password = child.text
            elif child.tag == 'USER_TYPE':
                user_type = child.text
            elif child.tag == 'FULL_NAME':
                full_name = child.text
            elif child.tag == 'EMAIL_ADDRESS':
                email = child.text
            elif child.tag == 'PHONE_NUMBER':
                phone_number = child.text
            
            elif child.tag == 'GROUP':
                if child.text:
                    group_lst = re.split('\s|,|;|:', child.text)
                    group_string = child.text
                else:
                    group_lst = []

            elif child.tag == 'DELIVERY':
                for child2 in child:
                    if child2.tag == 'EMAIL_HTML':
                        email_html = child2.text
                    if child2.tag == 'EMAIL_TEXT':
                        email_text = child2.text
                    if child2.tag == 'EMAIL_PAGER':
                        email_pager = child2.text
        
        # input validation
        if not username:
            continue
        
        # get existing user
        u = session.query(User).filter(User.username == username).all()
        if u:
            u = u[0]
        else:
            u = User()
        
        #if group_lst:                
        #    u.groups = [(session.query(Group)
        #                    .filter(Group.name == group_name)
        #                    .first())
        #                        for group_name in group_lst]
        
        u.group_string = group_string   
        u.username = username
        u.password = password
        u.email = email
        u.user_type = user_type
        u.full_name = full_name
        u.phone_number = phone_number
        
        session.add(u)
        
    add_users_to_groups(session=session)
    session.commit()
    Local_Session.remove()
    
    log_message = ''
    status = 'finished'
    data = {'status': status,
            'message': 'Imported users',
            'log': log_message}
    
    return data
              
def add_facs_to_groups(session=None):
    '''
    Associate all groups with the facilities that fall inside their
    monitoring region
    '''
    
    groups = session.query(Group).all()
    for group in groups:
        group.facilities = (session.query(Facility)
                                .filter(Facility.in_grid(group))
                                .all())
            
def add_users_to_groups(session=None):
    '''
    Connect all existing groups to users who have joined that group.
    This info is saved in the user's group_string, so we can add
    groups after users have already been uploaded
    '''
    
    users = session.query(User).all()
    for user in users:
        user.groups = []
        if user.group_string:
            group_lst = re.split('\s|,|;|:', user.group_string)
            if group_lst != ['']:
                for group_name in group_lst:
                    group = (session.query(Group)
                                        .filter(Group.name == group_name)
                                        .all())
                    if group:
                        user.groups.append(group[0])
            
#######################################################################
########################## Manual Testing #############################

def create_fac(grid=None, fac_id='AUTO_GENERATED'):
    '''
    Create a facility that is inside of a grid with generic fragility
    '''
    
    facility = Facility()
    if grid:
        facility.lat_min = grid.lat_min + 1
        facility.lat_max = facility.lat_min + .1
        facility.lon_min = grid.lon_min + 1
        facility.lon_max = facility.lon_min + .1
    
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
########################## TEST FUNCTIONS #############################
def task_test():
    return {'status': 'finished', 'message': 'Success'}

def job_fail_test():
    return {'status': 'failed', 'message': 'Success'}



