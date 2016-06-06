import re
import sys
import time
import math
import itertools
import xml.etree.ElementTree as ET
from email.mime.text import MIMEText
from email.MIMEImage import MIMEImage
from email.MIMEMultipart import MIMEMultipart
from dbi.db_alchemy import *
from objects import *
from functions_util import *
import sys

modules_dir = sc_dir() + 'modules'
if modules_dir not in sys.path:
    sys.path += [modules_dir]
from werkzeug.security import generate_password_hash


def geo_json():
    '''Get earthquake feed from USGS and check for new earthquakes
    
    Gets new earthquakes from the JSON feed and logs them in the DB
    
    Returns:
        dict: a dictionary that contains information about the function run
        ::
            data = {'status': either 'finished' or 'failed',
                    'message': message to be returned to the UI,
                    'log': message to be added to ShakeCast log
                           and should contain info on error}
    '''
    error = ''
    log_message = ''
    status = 'failed'
    new_events = []
    new_shakemaps = []
    try:
        pg = Product_Grabber()
        pg.get_json_feed()
        new_event_log = ''
        new_shakemaps_log = ''
        new_events, log_message = pg.get_new_events()
        new_shakemaps, log_message = pg.get_new_shakemaps()
        pg.make_heartbeat()
        status = 'finished'
    except Exception as e:
        log_message = 'Failed to download ShakeMap products: Check internet connection and firewall settings'
        error = str(e)
        log_message += '\nError: %s' % error
    
    log_message = pg.log
    
    data = {'status': status,
            'message': 'Check for new earthquakes',
            'log': log_message,
            'error': error,
            'new_events': len(new_events),
            'new_shakemaps': len(new_shakemaps)}
    
    return data

def check_new():
    '''
    Search database for unprocessed shakemaps
    
    Returns:
        dict: a dictionary that contains information about the function run
        ::
            data = {'status': either 'finished' or 'failed',
                    'message': message to be returned to the UI,
                    'log': message to be added to ShakeCast log
                           and should contain info on error}
    '''
    log_message = ''
    error = ''
    try:
        session = Session()
        
        new_events = (session.query(Event)
                             .filter(Event.status=='new')
                             .all())
        new_shakemaps = (session.query(ShakeMap)
                                .filter(ShakeMap.status=='new')
                                .all())
        
    except Exception as e:
        error = str(e)
        log_message += 'failed to access database: {}'.format(error)
        
        
    try:
        if new_events:
            process_events(new_events, session=session)
            log_message += '\nProcessed Events: %s' % [str(ne) for ne in new_events]
        if new_shakemaps:
            process_shakemaps(new_shakemaps, session=session)
            log_message += '\nProcessed ShakeMaps: %s' % [str(sm) for sm in new_shakemaps]
        else:
            log_message += '\nNo new shakemaps'
     
    except Exception as e:
        raise
        error = str(e)
        log_message += 'failed to process new shakemaps: {}'.format(e)
        
    
    Session.remove()
    data = {'status': 'finished',
            'message': 'Check for new earthquakes',
            'log': log_message,
            'error': error}
    
    return data

def process_events(events=[], session=None, scenario=False):
    '''
    Process or reprocess events passed into the function. Will send
    NEW_EVENT and UPDATE emails
    
    Args:
        new_events (list): List of Event objects to process
        session (Session()): SQLAlchemy session
    
    Returns:
        dict: a dictionary that contains information about the function run
        ::
            data = {'status': either 'finished' or 'failed',
                    'message': message to be returned to the UI,
                    'log': message to be added to ShakeCast log
                           and should contain info on error}
    '''
    clock = Clock()
    sc = SC()
    groups_affected = []
    all_groups_affected = set()
    for event in events:
        # check if we should wait until daytime to process
        if (clock.nighttime() is True) and (scenario is False):
            if event.magnitude < sc.night_eq_mag_cutoff:
                continue
        
        if scenario is True:
            in_region = (session.query(Group)
                                        .filter(Group.point_inside(event))
                                        .all())
            groups_affected = [group for group in in_region
                                    if group.has_spec(not_type='scenario')]
            all_groups_affected.update(groups_affected)
        elif event.event_id != 'heartbeat':
            groups_affected = (session.query(Group)
                                        .filter(Group.point_inside(event))
                                        .all())
            all_groups_affected.update(groups_affected)
        else:
            all_groups = session.query(Group).all()
            groups_affected = [group for group in all_groups
                                    if group.has_spec(not_type='heartbeat')]
            all_groups_affected.update(groups_affected)
        
        event.status = 'processing_started'    
        if not groups_affected:
            event.status = 'no groups'
            session.commit()
            continue
        
        for group in groups_affected:
            # Check if the group gets NEW_EVENT messages
            if group.has_spec(not_type='NEW_EVENT'):
                
                # check new_event magnitude to make sure the group wants a notificaiton
                event_spec = [s for s in group.specs
                                    if s.notification_type == 'NEW_EVENT'][0]
                if event_spec.minimum_magnitude > event.magnitude:
                    continue
                
                notification = Notification(group=group,
                                            event=event,
                                            notification_type='NEW_EVENT',
                                            status='created')
                session.add(notification)
    
    if all_groups_affected:    
        for group in all_groups_affected:
            # get new notifications
            nots = (session.query(Notification)
                        .filter(Notification.notification_type == 'NEW_EVENT')
                        .filter(Notification.status == 'created')
                        .all())
                
            new_event_notification(notifications=nots)
            processed_events = [n.event for n in nots]
            for e in processed_events:
                e.status = 'processed'
            session.commit() 
    
def process_shakemaps(shakemaps=[], session=None, scenario=False):
    '''
    Process or reprocess the shakemaps passed into the function
    
    Args:
        shakemaps (list): List of ShakeMap objects to process
        session (Session()): SQLAlchemy session
    
    Returns:
        dict: a dictionary that contains information about the function run
        ::
            data = {'status': either 'finished' or 'failed',
                    'message': message to be returned to the UI,
                    'log': message to be added to ShakeCast log
                           and should contain info on error}
    '''
    clock = Clock()
    sc = SC()
    for shakemap in shakemaps:
        # check if we should wait until daytime to process
        if (clock.nighttime()) is True and scenario is False:
            if shakemap.event.magnitude < sc.night_eq_mag_cutoff:
                continue
            
        shakemap.status = 'processing_started'
        # open the grid.xml file and find groups affected by event
        grid = create_grid(shakemap)
        if scenario is True:
            in_region = (session.query(Group)
                                    .filter(Group.in_grid(grid))
                                    .all())
            groups_affected = [group for group in in_region
                                    if group.has_spec(not_type='scenario')]
        else:
            groups_affected = (session.query(Group)
                                        .filter(Group.in_grid(grid))
                                        .all())
        
        if not groups_affected:
            shakemap.status = 'no groups'
            session.commit()
            continue
        
        # send out new events and create inspection notifications
        for group in groups_affected:

            # check if the group gets inspection notifications
            if group.has_spec(not_type='DAMAGE'):
                
                # Check if the group gets notification for updates
                if shakemap.old_maps():
                    specs = [spec for spec in group.specs if spec.event_type == 'UPDATE']
                    if not specs:
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
                if fac_shaking is False:
                    continue

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
                                mmi=bindparam('MMI'),
                                pga=bindparam('PGA'),
                                psa03=bindparam('PSA03'),
                                psa10=bindparam('PSA10'),
                                psa30=bindparam('PSA30'),
                                pgv=bindparam('PGV'),
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
                engine.execute(stmt, fac_shaking_lst)
            # quick check for relationships before inserting into
            # database in order to avoid errors in strange
            # circumstances... probably not necessary
            if relationships:
                engine.execute(rel_stmt, relationships)
            session.commit()
            
            # send inspection notifications for the shaking levels we
            # just computed
            [inspection_notification(notification=n,
                                     grid=grid) for n in notifications]
                
            shakemap.status = 'processed'    
        else:
            shakemap.status = 'no groups'
        
        session.commit()
        
def make_inspection_prios(facility=None,
                          shakemap=None,
                          grid=None,
                          notifications=[]):
    '''
    Determines inspection priorities for the input facility
    
    Args:
        facility (Facility): A facility to be processed
        shakemap (ShakeMap): The ShakeMap which is associated with the shaking
        grid (SM_Grid): The grid built from the ShakeMap
        notifications (list): List of Notification objects which should be associated with the shaking
        
    Returns:
        dict: A dictionary with all the parameters needed to make a Facility_Shaking entry in the database
        ::
            fac_shaking = {'grey': PDF Value,
                           'green': PDF Value,
                           'yellow': PDF Value,
                           'orange': PDF Value,
                           'red': PDF Value,
                           'metric': which metric is used to compute PDF values,
                           'facility_id': shakecast_id of the facility that's shaking,
                           'shakemap_id': shakecast_id of the associated ShakeMap,
                           '_shakecast_id': ID for the Facility_Shaking entry that will be created,
                           'update': bool -- True if an ID already exists for this Facility_Shaking,
                           'alert_level': string ('grey', 'green', 'yellow' ...),
                           'weight': float that determines inspection priority,
                           'notifications': list of notifications associated with this shaking}
    '''
    
    # get the largest shaking level affecting the facility
    shaking_point = grid.max_shaking(facility=facility)
    if shaking_point is None:
        return False
    
    # use the max shaking value to create fragility curves for the
    # damage states
    fac_shaking = facility.make_alert_level(shaking_point=shaking_point,
                                            shakemap=shakemap,
                                            notifications=notifications)
    return fac_shaking
    
def new_event_notification(notifications = [],
                           scenario=False):
    """
    Build and send HTML email for a new event or scenario
    
    Args:
        event (ShakeMap): which ShakeMap the Notification is attached to
        group (Group): The Group that this Notification is being send to
        notification (Notification): The Notification that will be sent
        scenario (bool): True if the user is running a scenario
        
    Returns:
        None
    """
    url_opener = URLOpener()
    
    events = [n.event for n in notifications]
    group = notifications[0].group
    notification = notifications[0]
    
    # aggregate multiple events
    for n in notifications[1:]:
        n.status = 'aggregated'

    # create HTML for the event email
    not_builder = Notification_Builder()
    not_builder.buildNewEventHTML(events)
    
    notification.status = 'HTML success'

    #initiate message
    msg = MIMEMultipart()
    
    # attach html
    msg_html = MIMEText(not_builder.html, 'html')
    msg.attach(msg_html)

    # get and attach map
    for count,event in enumerate(events):
        gmap = url_opener.open("https://maps.googleapis.com/maps/api/staticmap?center=%s,%s&zoom=5&size=200x200&sensor=false&maptype=terrain&markers=icon:http://earthquake.usgs.gov/research/software/shakecast/icons/epicenter.png|%s,%s" % (event.lat, event.lon ,event.lat, event.lon))
        msg_gmap = MIMEImage(gmap)
        msg_gmap.add_header('Content-ID', '<gmap{0}>'.format(count))
        msg_gmap.add_header('Content-Disposition', 'inline')
        msg.attach(msg_gmap)
    
    # find the ShakeCast logo
    logo_str = '{0}view{1}static{1}sc_logo.png'.format(sc_dir(),
                                                       get_delim())
    
    # open logo and attach it to the message
    logo_file = open(logo_str, 'rb')
    msg_image = MIMEImage(logo_file.read())
    logo_file.close()
    msg_image.add_header('Content-ID', '<sc_logo>')
    msg_image.add_header('Content-Disposition', 'inline')
    msg.attach(msg_image)
    
    mailer = Mailer()
    me = mailer.me
    you = [user.email for user in group.users]
    
    if len(events) == 1:
        msg['Subject'] = event.title
    else:
        mags = []
        for e in events:
            if e.event_id == 'heartbeat':
                mags += ['None']
            else:
                mags += [e.magnitude]
                
        msg['Subject'] = '{0} New Events -- Magnitudes: {1}'.format(len(events),
                                                                    str(mags).replace("'", ''))
        
    msg['To'] = ', '.join(you)
    msg['From'] = me
    
    mailer.send(msg=msg, you=you)
    
    notification.status = 'sent'
    
def inspection_notification(notification=Notification(),
                            grid=SM_Grid()):
    '''
    Create local products and send inspection notification
    
    Args:
        notification (Notification): The Notification that will be sent
        grid (SM_Grid): create from the ShakeMap

    Returns:
        None
    '''
    shakemap = notification.shakemap
    group = notification.group
    try:
        not_builder = Notification_Builder()
        not_builder.buildInspHTML(shakemap)
    
        notification.status = 'file success'
    except:
        notification.status = 'file failed'
    
    # if the file was created successfully, try sending it
    if notification.status != 'file failed':
        try:
            #initiate message
            msg = MIMEMultipart()
            
            # attach html
            msg_html = MIMEText(not_builder.html, 'html')
            msg.attach(msg_html)
            
            # get and attach shakemap
            shakemap_file = '{0}{1}{2}'.format(shakemap.directory_name,
                                                        get_delim(),
                                                        'intensity.jpg')
            shakemap_image = open(shakemap_file, 'r')
            msg_shakemap = MIMEImage(shakemap_image.read())
            shakemap_image.close()
            msg_shakemap.add_header('Content-ID', '<shakemap>')
            msg_shakemap.add_header('Content-Disposition', 'inline')
            msg.attach(msg_shakemap)
            
            # find the ShakeCast logo
            logo_str = '{0}view{1}static{1}sc_logo.png'.format(sc_dir(),
                                                               get_delim())
            
            # open logo and attach it to the message
            logo_file = open(logo_str, 'rb')
            msg_image = MIMEImage(logo_file.read())
            logo_file.close()
            msg_image.add_header('Content-ID', '<sc_logo>')
            msg_image.add_header('Content-Disposition', 'inline')
            msg.attach(msg_image)
            
            mailer = Mailer()
            me = mailer.me
            you = [user.email for user in group.users]
            
            msg['Subject'] = '{0} {1}'.format('Inspection - ', shakemap.event.title)
            msg['To'] = ', '.join(you)
            msg['From'] = me
            
            mailer.send(msg=msg, you=you)
            
            notification.status = 'sent'
        except:
            notification.status = 'send failed'
            
def run_scenario(eq_id='', region=''):
    '''
    Processes a shakemap as if it were new
    '''
    
    session = Session()
    # Check if we have the eq in db
    full_id = '{0}{1}'.format(region, eq_id)
    
    event = session.query(Event).filter(Event.event_id == full_id).all()
    shakemap = session.query(ShakeMap).filter(ShakeMap.shakemap_id == full_id).all()
    
    processed_event = False
    processed_shakemap = False
    if event:
        try:
            process_events(events=[event[0]],
                           session=session,
                           scenario=True)
            processed_event = True
        except:
            pass
    if shakemap:
        try:
            process_shakemaps(shakemaps=[shakemap[0]],
                              session=session,
                              scenario=True)
            processed_shakemap = True
        except:
            pass
        
    return processed_event, processed_shakemap
      
def create_grid(shakemap=None):
    """
    Creates a grid object from a specific ShakeMap
    
    Args:
        shakemap (ShakeMap): A ShakeMap with a grid.xml to laod
    
    Returns:
        SM_Grid: With loaded grid.xml
    """
    grid = SM_Grid()
    grid.load(shakemap.directory_name + get_delim() + 'grid.xml')
    
    return grid    

#######################################################################
######################## Import Inventory Data ########################

def import_facility_xml(xml_file=''):
    '''
    Import an XML file created by the ShakeCast workbook; Facilities
    
    Args:
        xml_file (string): The filepath to the xml_file that will be uploaded
        
    Returns:
        dict: a dictionary that contains information about the function run
        ::
            data = {'status': either 'finished' or 'failed',
                    'message': message to be returned to the UI,
                    'log': message to be added to ShakeCast log
                           and should contain info on error}
    '''
    session = Session()
    
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
    
    Session.remove()
    
    log_message = ''
    status = 'finished'
    data = {'status': status,
            'message': 'Imported Facilities',
            'log': log_message}
    
    return data
    
def import_group_xml(xml_file=''):
    '''
    Import an XML file created by the ShakeCast workbook; Groups
    
    Args:
        xml_file (string): The filepath to the xml_file that will be uploaded
        
    Returns:
        dict: a dictionary that contains information about the function run
        ::
            data = {'status': either 'finished' or 'failed',
                    'message': message to be returned to the UI,
                    'log': message to be added to ShakeCast log
                           and should contain info on error}
    '''
    session = Session()
    
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
    Session.remove()
    
    log_message = ''
    status = 'finished'
    data = {'status': status,
            'message': 'Imported Groups',
            'log': log_message}
    
    return data

def import_user_xml(xml_file=''):
    '''
    Import an XML file created by the ShakeCast workbook; Users
    
    Args:
        xml_file (string): The filepath to the xml_file that will be uploaded
        
    Returns:
        dict: a dictionary that contains information about the function run
        ::
            data = {'status': either 'finished' or 'failed',
                    'message': message to be returned to the UI,
                    'log': message to be added to ShakeCast log
                           and should contain info on error}
    '''
    session = Session()
    
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
        u.password = generate_password_hash(password, method='pbkdf2:sha512')
        u.email = email
        u.user_type = user_type
        u.full_name = full_name
        u.phone_number = phone_number
        
        session.add(u)
        
    add_users_to_groups(session=session)
    session.commit()
    Session.remove()
    
    log_message = ''
    status = 'finished'
    data = {'status': status,
            'message': 'Imported users',
            'log': log_message}
    
    return data

def determine_xml(xml_file=''):
    tree = ET.parse(xml_file)
    root = tree.getroot()
    
    xml_type = ''
    if 'FacilityTable' in str(root):
        xml_type = 'facility'
    elif 'GroupTable' in str(root):
        xml_type = 'group'
    elif 'UserTable' in str(root):
        xml_type = 'user'
    else:
        xml_type = 'unknown'
        
    return xml_type
    
    
              
def add_facs_to_groups(session=None):
    '''
    Associate all groups with the facilities that fall inside their
    monitoring region
    
    Args:
        session (Session): A SQLAlchemy session
    Returns:
        None
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
    
    Args:
        session (Session): A SQLAlchemy session
    Returns:
        None
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
    **ONLY TO BE USED WHEN TESTING**
    **THIS FUNCTION MAY NOT BE UPDATED**
    
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

def create_user():
    """
    **ONLY TO BE USED WHEN TESTING**
    **THIS FUNCTION MAY NOT BE UPDATED**
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
    **ONLY TO BE USED WHEN TESTING**
    **THIS FUNCTION MAY NOT BE UPDATED**
    """
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
    """
    **ONLY TO BE USED WHEN TESTING**
    **THIS FUNCTION MAY NOT BE UPDATED**
    """
    while True:
        nots = session.query(Notification).filter(Notification.notification_type == 'Inspection').all()
        for n in nots:
            print 'ID: %s \nSHAKING: %s' % (n.shakecast_id, n.facility_shaking)
            time.sleep(1)
            os.system('cls' if os.name == 'nt' else 'clear')
        session.commit()

#######################################################################
########################## TEST FUNCTIONS #############################
def task_test():
    return {'status': 'finished', 'message': 'Success'}

def job_fail_test():
    return {'status': 'failed', 'message': 'Success'}



