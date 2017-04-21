import re
import sys
import itertools
import xml.etree.ElementTree as ET
from email.mime.text import MIMEText
from email.MIMEImage import MIMEImage
from email.MIMEMultipart import MIMEMultipart
from orm import *
from objects import *
from util import *
import xmltodict
import shutil

modules_dir = os.path.join(sc_dir() + 'modules')
if modules_dir not in sys.path:
    sys.path += [modules_dir]
from werkzeug.security import generate_password_hash


def geo_json(query_period='day'):
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
        pg = ProductGrabber()
        pg.query_period = query_period
        pg.get_json_feed()
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
        error = '{}: {}'.format(type(e), str(e))
        log_message += 'failed to process new shakemaps: {}'.format(e)
        
    
    Session.remove()
    data = {'status': 'finished',
            'message': 'Check for new earthquakes',
            'log': log_message,
            'error': error}
    
    return data

def process_events(events=None, session=None, scenario=False):
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

            filtered_groups = [group for group in groups_affected 
                                    if group.has_spec(not_type='scenario') is False]

            all_groups_affected.update(filtered_groups)
        else:
            all_groups = session.query(Group).all()
            groups_affected = [group for group in all_groups
                                    if group.has_spec(not_type='heartbeat')]
            all_groups_affected.update(groups_affected)
        
        if not groups_affected:
            event.status = 'no groups'
            session.commit()
        else:
            event.status = 'processing_started'
        
        for group in all_groups_affected:
            # Check if the group gets NEW_EVENT messages
            if group.has_spec(not_type='NEW_EVENT'):
                
                # check new_event magnitude to make sure the group wants a 
                # notificaiton
                event_spec = [s for s in group.specs
                                    if s.notification_type == 'NEW_EVENT'][0]
                if event_spec.minimum_magnitude > event.magnitude:
                    continue
                
                notification = Notification(group=group,
                                            event=event,
                                            notification_type='NEW_EVENT',
                                            status='created')
                session.add(notification)
        session.commit()
    
    if all_groups_affected:
        for group in all_groups_affected:
            # get new notifications
            nots = (session.query(Notification)
                        .filter(Notification.notification_type == 'NEW_EVENT')
                        .filter(Notification.status == 'created')
                        .filter(Notification.group_name == group.name)
                        .all())
            
            filter_nots = filter(lambda x: x.event is not None, nots)
            new_event_notification(notifications=filter_nots,
                                    scenario=scenario)
            processed_events = [n.event for n in filter_nots]
            for e in processed_events:
                if scenario is True:
                    e.status = 'scenario'
                else:
                    e.status = 'processed'
            session.commit()
    
def process_shakemaps(shakemaps=None, session=None, scenario=False):
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
                                            event=shakemap.event,
                                            notification_type='DAMAGE',
                                            status='created')
                
                session.add(notification)
        session.commit()
        
        notifications = (session.query(Notification)
                    .filter(Notification.shakemap == shakemap)
                    .filter(Notification.notification_type == 'DAMAGE')
                    .filter(Notification.status != 'sent')
                    .all())
        
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
        
        if affected_facilities:
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
                        .values(gray=bindparam('gray'),
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
 
            shakemap.status = 'processed'
        else:
            shakemap.status = 'processed - no facs'
        
        if scenario is True:
            shakemap.status = 'scenario'

        if notifications:
            # send inspection notifications for the shaking levels we
            # just computed
            for n in notifications:
                inspection_notification(notification=n,
                                        grid=grid,
                                        scenario=scenario)
        
        session.commit()
        
def make_inspection_prios(facility=None,
                          shakemap=None,
                          grid=None,
                          notifications=None):
    '''
    Determines inspection priorities for the input facility
    
    Args:
        facility (Facility): A facility to be processed
        shakemap (ShakeMap): The ShakeMap which is associated with the shaking
        grid (ShakeMapGrid): The grid built from the ShakeMap
        notifications (list): List of Notification objects which should be associated with the shaking
        
    Returns:
        dict: A dictionary with all the parameters needed to make a Facility_Shaking entry in the database
        ::
            fac_shaking = {'gray': PDF Value,
                           'green': PDF Value,
                           'yellow': PDF Value,
                           'orange': PDF Value,
                           'red': PDF Value,
                           'metric': which metric is used to compute PDF values,
                           'facility_id': shakecast_id of the facility that's shaking,
                           'shakemap_id': shakecast_id of the associated ShakeMap,
                           '_shakecast_id': ID for the Facility_Shaking entry that will be created,
                           'update': bool -- True if an ID already exists for this Facility_Shaking,
                           'alert_level': string ('gray', 'green', 'yellow' ...),
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
    
def new_event_notification(notifications = None,
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
    events = [n.event for n in notifications]
    group = notifications[0].group
    notification = notifications[0]
    
    # aggregate multiple events
    for n in notifications[1:]:
        n.status = 'aggregated'

    # create HTML for the event email
    not_builder = NotificationBuilder()
    html = not_builder.build_new_event_html(events=events, notification=notification)
    
    notification.status = 'HTML success'

    #initiate message
    msg = MIMEMultipart()
    
    # attach html
    msg_html = MIMEText(html.encode('utf-8'), 'html', 'utf-8')
    msg.attach(msg_html)

    # get and attach map
    for count,event in enumerate(events):
        map_image = open(os.path.join(event.directory_name,
                                      'image.png'), 'rb')
        msg_gmap = MIMEImage(map_image.read(), _subtype='png')
        map_image.close()
        
        msg_gmap.add_header('Content-ID', '<gmap{0}_{1}>'.format(count, notification.shakecast_id))
        msg_gmap.add_header('Content-Disposition', 'inline')
        msg.attach(msg_gmap)
    
    # find the ShakeCast logo
    logo_str = os.path.join(sc_dir(),'view','static','sc_logo.png')
    
    # open logo and attach it to the message
    logo_file = open(logo_str, 'rb')
    msg_image = MIMEImage(logo_file.read(), _subtype='png')
    logo_file.close()
    msg_image.add_header('Content-ID', '<sc_logo_{0}>'.format(notification.shakecast_id))
    msg_image.add_header('Content-Disposition', 'inline')
    msg.attach(msg_image)
    
    mailer = Mailer()
    me = mailer.me
    you = [user.email for user in group.users]
    
    if len(you) > 0:
        if len(events) == 1:
            msg['Subject'] = event.title.encode('utf-8')
        else:
            mags = []
            for e in events:
                if e.event_id == 'heartbeat':
                    mags += ['None']
                else:
                    mags += [e.magnitude]
                    
            msg['Subject'] = '{0} New Events -- Magnitudes: {1}'.format(len(events),
                                                                        str(mags).replace("'", ''))
        
        if scenario is True:
            msg['Subject'] = 'SCENARIO: ' + msg['Subject']

        msg['To'] = ', '.join(you)
        msg['From'] = me
        
        mailer.send(msg=msg, you=you)
        
        notification.status = 'sent'
        
    else:
        notification.status = 'not sent - no users'
    
def inspection_notification(notification=Notification(),
                            grid=ShakeMapGrid(),
                            scenario=False):
    '''
    Create local products and send inspection notification
    
    Args:
        notification (Notification): The Notification that will be sent
        grid (ShakeMapGrid): create from the ShakeMap

    Returns:
        None
    '''
    shakemap = notification.shakemap
    group = notification.group
    error = ''
    try:
        not_builder = NotificationBuilder()
        html = not_builder.build_insp_html(shakemap)
    
        notification.status = 'file success'
    except Exception as e:
        error = str(e)
        notification.status = 'file failed'
    
    # if the file was created successfully, try sending it
    if notification.status != 'file failed':
        try:
            #initiate message
            msg = MIMEMultipart()
            
            # attach html
            msg_html = MIMEText(html, 'html')
            msg.attach(msg_html)
            
            # get and attach shakemap
            msg_shakemap = MIMEImage(shakemap.get_map(), _subtype='jpeg')
            msg_shakemap.add_header('Content-ID', '<shakemap{0}>'.format(shakemap.shakecast_id))
            msg_shakemap.add_header('Content-Disposition', 'inline')
            msg.attach(msg_shakemap)
            
            # find the ShakeCast logo
            logo_str = os.path.join(sc_dir(),'view','static','sc_logo.png')
            
            # open logo and attach it to the message
            logo_file = open(logo_str, 'rb')
            msg_image = MIMEImage(logo_file.read())
            logo_file.close()
            msg_image.add_header('Content-ID', '<sc_logo{0}>'.format(shakemap.shakecast_id))
            msg_image.add_header('Content-Disposition', 'inline')
            msg.attach(msg_image)
            
            mailer = Mailer()
            me = mailer.me
            you = [user.email for user in group.users]
            
            if len(you) > 0:
                msg['Subject'] = '{0} {1}'.format('Inspection - ', shakemap.event.title)

                if scenario is True:
                    msg['Subject'] = 'SCENARIO: ' + msg['Subject']

                msg['To'] = ', '.join(you)
                msg['From'] = me
                
                mailer.send(msg=msg, you=you)
                
                notification.status = 'sent'

            else:
                notification.status = 'not sent - no users'
        except Exception as e:
            error = str(e)
            notification.status = 'send failed'

        return {'status': notification.status,
                'error': error}

def download_scenario(shakemap_id=None, scenario=False):
    if shakemap_id is not None:
        pg = ProductGrabber()
        success = pg.get_scenario(shakemap_id=shakemap_id, scenario=scenario)

        if success is True:
            status = 'finished'
            message = 'Downloaded scenario: ' + shakemap_id
            success = True
        else:
            status = 'failed'
            message = 'Failed scenario download: ' + shakemap_id
            success = False
            
    return {'status': status,
            'message': {'from': 'scenario_download',
                        'title': 'Scenario Download Finished',
                        'message': message,
                        'success': success},
            'log': 'Download scenario: ' + shakemap_id + ', ' + status}

def delete_scenario(shakemap_id=None):
    session = Session()
    scenario = (session.query(ShakeMap).filter(ShakeMap.shakemap_id == shakemap_id)
                                            .first())
    event = (session.query(Event).filter(Event.event_id == shakemap_id).first())

    if scenario is not None:
        # remove files
        remove_dir(scenario.directory_name)
        session.delete(scenario)

    if event is not None:
        # remove files
        remove_dir(event.directory_name)
        session.delete(event)

    session.commit()
    Session.remove()

    return {'status': 'finished',
            'message': {'message': 'Successfully removed scenario: ' + shakemap_id, 
                        'title': 'Scenario Deleted',
                        'success': True},
            'log': 'Deleted scenario: ' + shakemap_id}

def remove_dir(directory_name):
    '''
    Remove any directory given its path -- used when deleting earthquake
    data and testing
    '''

    if os.path.exists(directory_name):
        shutil.rmtree(directory_name)
        success = True
    else:
        success = False
    
    return success

def run_scenario(shakemap_id=None):
    '''
    Processes a shakemap as if it were new
    '''
    
    session = Session()
    # Check if we have the eq in db
    event = session.query(Event).filter(Event.event_id == shakemap_id).all()
    shakemap = session.query(ShakeMap).filter(ShakeMap.shakemap_id == shakemap_id).all()
    
    if event:
        try:
            process_events(events=[event[0]],
                           session=session,
                           scenario=True)
            processed_event = True
        except Exception:
            processed_event = False

    else:
        processed_event = False

    if shakemap:
        try:
            process_shakemaps(shakemaps=[shakemap[0]],
                              session=session,
                              scenario=True)
            processed_shakemap = True
        except Exception:
            processed_shakemap = False
    
    else:
        processed_shakemap = False
    
    if processed_event is False or processed_shakemap is False:
        message = 'Scenario run failed'
    else:
        message = 'Scenario run complete'
    
    return {'status': 'finished',
            'message': {'from': 'scenario_run',
                        'title': 'Scenario: {}'.format(shakemap_id),
                        'message': message,
                        'success': processed_event and processed_shakemap},
            'log': 'Run scenario: ' + shakemap_id}
      
def create_grid(shakemap=None):
    """
    Creates a grid object from a specific ShakeMap
    
    Args:
        shakemap (ShakeMap): A ShakeMap with a grid.xml to laod
    
    Returns:
        ShakeMapGrid: With loaded grid.xml
    """
    grid = ShakeMapGrid()
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
    
    tree = ET.parse(xml_file)
    root = tree.getroot()
    facs = [child for child in root]
    count_dict = {}
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
        gray = -1
        gray_beta = -1
        gray_metric = ''
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
                        if child2.tag == 'GREY' or child2.tag == 'GRAY':
                            if child3.tag == 'METRIC':
                                gray_metric = child3.text
                            elif child3.tag == 'ALPHA':
                                gray = float(child3.text)
                            elif child3.tag == 'BETA':
                                gray_beta = float(child3.text)
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
            for f in existing:
                session.delete(f)
            
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
        f.gray = gray
        f.gray_beta = gray_beta
        f.gray_metric = gray_metric
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
                
                f.lon_min = lon - .01
                f.lon_max = lon + .01
                f.lat_min = lat - .01
                f.lat_max = lat + .01
                
            elif geom_type == 'POLYGON':
                points = [p.split(',') for p in geom.split(';')]
                lons = [pnt[0] for pnt in points]
                lats = [pnt[1] for pnt in points]
                
                f.lon_min = min(lons)
                f.lon_max = max(lons)
                f.lat_min = min(lats)
                f.lat_max = max(lats)
                
            elif geom_type == 'POLYLINE':
                pass
            
        session.add(f)

        if count_dict.get(f.facility_type, False) is False:
            count_dict[f.facility_type] = 1
        else:
            count_dict[f.facility_type] += 1

    add_facs_to_groups(session=session)
    session.commit()
    
    Session.remove()
    
    message = ''
    for key, val in count_dict.iteritems():
        message += '{}: {}\n'.format(key, val)

    log_message = ''
    status = 'finished'
    data = {'status': status,
            'message': {'from': 'facility_import',
                        'title': 'Imported Facilities',
                        'message': message,
                        'success': True},
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
    imported_groups = []

    for group in groups:
        name = ''
        facility_type = ''
        notification_type = ''
        inspection_priority = ''
        minimum_magnitude = 0
        event_type = ''
        notification_format = ''
        aggregate_name = 'Default'
        damage_level = ''
        template = None
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

        imported_groups += [g.name]
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
                    elif child2.tag == 'MESSAGE_FORMAT':
                        template = child2.text
            
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
                spec.event_type = event_type
    

    g.template = template
    add_facs_to_groups(session=session)
    add_users_to_groups(session=session)
    session.commit()
    Session.remove()
    
    log_message = ''
    status = 'finished'
    data = {'status': status,
            'message': {'title': 'Group Upload',
                        'message': imported_groups},
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
    with open(xml_file, 'r') as xml_str:
        user_xml_dict = json.loads(json.dumps(xmltodict.parse(xml_str)))
        user_list = user_xml_dict['UserTable']['UserRow']
        if isinstance(user_list, list) is False:
            user_list = [user_list]

    data = import_user_dicts(user_list)
    
    return data

def import_user_dicts(users=None):
    session = Session()
    if users is not None:
        for user in users:
            username = user.get('USERNAME', user.get('username', ''))
            # input validation
            if not username:
                continue
        
            # get existing user
            u = session.query(User).filter(User.username == username).all()
            if u:
                u = u[0]
            else:
                u = User()
                u.username = username
        
            u.group_string = user.get('GROUP', user.get('group_string', ''))
            u.email = user.get('EMAIL_ADDRESS', user.get('email', ''))
            u.user_type = user.get('USER_TYPE', user.get('user_type', ''))
            u.full_name = user.get('FULL_NAME', user.get('full_name', ''))
            u.phone_number = user.get('PHONE_NUMBER', user.get('group_string', ''))
            
            password = user.get('PASSWORD', user.get('password', None))
            if password is not None:
                u.password = generate_password_hash(password, method='pbkdf2:sha512')

            session.add(u)
        session.commit()
        add_users_to_groups(session=session)
        session.commit()

    Session.remove()
    log_message = ''
    status = 'finished'
    data = {'status': status,
            'message': {'from': 'import_user_dicts',
                        'title': 'User Upload',
                        'message': 'User update complete',
                        'success': True},
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

def delete_inventory_by_id(inventory_type=None, ids=None):
    '''
    Function made to be run by the ShakeCast server deletes facilities
    by their shakecast_id
    inventory types: facility, group, user, earthquake
    '''
    deleted = []
    if inventory_type is not None and ids is not None:
        if inventory_type == 'facility':
            inv_table = Facility
        elif inventory_type == 'group':
            inv_table = Group
        elif inventory_type == 'user':
            inv_table = User

        session = Session()
        inventory = session.query(inv_table).filter(inv_table
                                            .shakecast_id
                                            .in_(ids)).all()
        # delete inventory
        for inv in inventory:
            session.delete(inv)
            deleted += [inv]
        session.commit()

        Session.remove()

    return {'status': 'finished', 'message': deleted}


def check_for_updates():
    status = ''
    error = ''
    update_required = None
    try:
        s = SoftwareUpdater()
        update_required, notify, update_info = s.check_update()

        if notify is True:
            s.notify_admin(update_info=update_info)
        status = 'finished'
    except Exception as e:
        error = str(e)
        status = 'failed'

    return {'status': status, 'message': update_required, 'error': error}
#######################################################################
########################## TEST FUNCTIONS #############################
def task_test():
    return {'status': 'finished', 'message': 'Success'}

def job_fail_test():
    return {'status': 'failed', 'message': 'Success'}



