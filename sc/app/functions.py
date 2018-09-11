import re
import sys
import itertools
import xml.etree.ElementTree as ET
from email.mime.text import MIMEText
from email.mime.image import MIMEImage
from email.mime.multipart import MIMEMultipart
import xmltodict
import shutil
import time
from orm import *
from objects import *
from util import *

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

@dbconnect
def check_new(session=None):
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
        new_events = (session.query(Event)
                             .filter(Event.status=='new')
                             .all())
        new_shakemaps = (session.query(ShakeMap)
                                .filter(ShakeMap.status=='new')
                                .all())

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
        log_message += 'failed to process new events/shakemaps: {}'.format(e)
        
    data = {'status': 'finished',
            'message': 'Check for new earthquakes',
            'log': log_message,
            'error': error}
    
    return data

@dbconnect
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
                                    if group.gets_notification('new_event', scenario=True)]

            all_groups_affected.update(groups_affected)
        elif event.event_id != 'heartbeat':
            groups_affected = (session.query(Group)
                                        .filter(Group.point_inside(event))
                                        .all())

            filtered_groups = [group for group in groups_affected 
                                    if group.gets_notification('new_event')]

            all_groups_affected.update(filtered_groups)
        else:
            all_groups = session.query(Group).all()

            groups_affected = [group for group in all_groups
                                    if group.gets_notification('new_event', heartbeat=True)]

            all_groups_affected.update(groups_affected)
        
        if not groups_affected:
            event.status = 'processed - no groups'
            session.commit()
        else:
            event.status = 'processing_started'
        
        for group in all_groups_affected:

            # check new_event magnitude to make sure the group wants a 
            # notificaiton
            event_spec = group.get_new_event_spec(scenario=scenario)

            if (event_spec is None or
                    event_spec.minimum_magnitude > event.magnitude):
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
                        .filter(Notification.group_id == group.shakecast_id)
                        .all())

            last_day = time.time() - 60 * 60 * 5
            filter_nots = filter(lambda x: x.event is not None and (x.event.time > last_day or scenario is True), nots)

            if len(filter_nots) > 0:
                new_event_notification(notifications=filter_nots,
                                        scenario=scenario)
            
            processed_events = [n.event for n in filter_nots]

            for e in processed_events:
                e.status = 'processed'

    if scenario is True:
        for event in events:
            event.status = 'scenario'
    
@dbconnect
def process_shakemaps(shakemaps=None, session=None, scenario=False):
    '''
    Process or reprocess the shakemaps passed into the function
    
    Args:
        shakemaps (list): List of ShakeMap objects to process
        session (Session()): SQLAlchemy session
        scenario (boolean): True for manually triggered events
    
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
                                    if group.gets_notification('damage', scenario=True)]
        else:
            in_region = (session.query(Group)
                                        .filter(Group.in_grid(grid))
                                        .all())
            groups_affected = [group for group in in_region
                                    if group.gets_notification('damage')]
        
        if not groups_affected:
            shakemap.status = 'processed - no groups'
            session.commit()
            continue
        
        # send out new events and create inspection notifications
        for group in groups_affected:
                    
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

        geoJSON = {'type': 'FeatureCollection',
                    'features': [None] * len(affected_facilities),
                    'properties': {}}
        if affected_facilities:
            fac_shaking_lst = [None] * len(affected_facilities)
            f_count = 0
            for facility in affected_facilities:
                fac_shaking = make_inspection_priority(facility=facility,
                                                    shakemap=shakemap,
                                                    grid=grid)
                if fac_shaking is False:
                    continue
                
                fac_shaking_lst[f_count] = FacilityShaking(**fac_shaking)

                geoJSON['features'][f_count] = makeGeoJSONDict(facility,
                                                                fac_shaking)

                f_count += 1

            # Remove all old shaking and add all fac_shaking_lst
            shakemap.facility_shaking = []
            session.commit()

            session.bulk_save_objects(fac_shaking_lst)
            session.commit()

            geoJSON['properties']['impact-summary'] = get_event_impact(shakemap)

            saveGeoJson(shakemap, geoJSON)

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
                                        scenario=scenario,
                                        session=session)
        
        session.commit()

def makeGeoJSONDict(facility, fac_shaking):
    jsonDict = {
        'type': 'Feature',
        'geometry': {
            'type': 'Point',
            'coordinates': [facility.lon, facility.lat]
        }
    }

    jsonDict['properties'] = {
        'facility_name': facility.name,
        'description': facility.description,
        'facility_type': facility.facility_type,
        'lat': facility.lat,
        'lon': facility.lon,
        'shaking': fac_shaking
    }

    return jsonDict

def saveGeoJson(shakemap, geoJSON):
    json_file = os.path.join(shakemap.directory_name,
                                'impact.json')

    with open(json_file, 'w') as f_:
        f_.write(json.dumps(geoJSON))

def make_inspection_priority(facility=None,
                          shakemap=None,
                          grid=None):
    '''
    Determines inspection priorities for the input facility
    
    Args:
        facility (Facility): A facility to be processed
        shakemap (ShakeMap): The ShakeMap which is associated with the shaking
        grid (ShakeMapGrid): The grid built from the ShakeMap
        notifications (list): List of Notification objects which should be associated with the shaking
        
    Returns:
        dict: A dictionary with all the parameters needed to make a FacilityShaking entry in the database
        ::
            fac_shaking = {'gray': PDF Value,
                           'green': PDF Value,
                           'yellow': PDF Value,
                           'orange': PDF Value,
                           'red': PDF Value,
                           'metric': which metric is used to compute PDF values,
                           'facility_id': shakecast_id of the facility that's shaking,
                           'shakemap_id': shakecast_id of the associated ShakeMap,
                           '_shakecast_id': ID for the FacilityShaking entry that will be created,
                           'update': bool -- True if an ID already exists for this FacilityShaking,
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
                                            shakemap=shakemap)
    return fac_shaking
    
def new_event_notification(notifications=None,
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
    message = not_builder.build_new_event_html(events=events, notification=notification)
    
    notification.status = 'Message built'

    #initiate message
    msg = MIMEMultipart()
    
    # attach html
    message_type = 'html' if '<html>' in message else 'plain'
    encoded_message = MIMEText(message.encode('utf-8'), message_type, 'utf-8')
    msg.attach(encoded_message)

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
    temp_manager = TemplateManager()
    configs = temp_manager.get_configs('new_event', 
                                        name=notification.group.template)
    logo_str = os.path.join(sc_dir(),'view','assets',configs['logo'])
    
    # open logo and attach it to the message
    logo_file = open(logo_str, 'rb')
    msg_image = MIMEImage(logo_file.read(), _subtype='png')
    logo_file.close()
    msg_image.add_header('Content-ID', '<sc_logo_{0}>'.format(notification.shakecast_id))
    msg_image.add_header('Content-Disposition', 'inline')
    msg.attach(msg_image)
    
    mailer = Mailer()
    me = mailer.me

    # get notification format
    not_format = group.get_notification_format(notification, scenario)

    # get notification destination based on notification format
    you = [user.__dict__[not_format] for user in group.users
            if user.__dict__.get(not_format, False)]
    
    if len(you) > 0:
        if len(events) == 1:
            subject = event.title.encode('utf-8')
        else:
            mags = []
            for e in events:
                if e.event_id == 'heartbeat':
                    mags += ['None']
                else:
                    mags += [e.magnitude]
                    
            subject = '{0} New Events -- Magnitudes: {1}'.format(len(events),
                                                                        str(mags).replace("'", ''))
        
        if scenario is True:
            subject = 'SCENARIO: ' + subject

        msg['Subject'] = subject
        msg['To'] = ', '.join(you)
        msg['From'] = me
        
        mailer.send(msg=msg, you=you)
        
        notification.status = 'sent'
        
    else:
        notification.status = 'not sent - no users'

@dbconnect
def inspection_notification(notification=None,
                            scenario=False,
                            session=None):
    '''
    Create local products and send inspection notification
    
    Args:
        notification (Notification): The Notification that will be sent

    Returns:
        None
    '''
    shakemap = notification.shakemap
    group = notification.group
    error = ''

    has_alert_level, new_inspection, update = check_notification_for_group(
        group,
        notification,
        session=session,
        scenario=scenario
    )

    if has_alert_level and new_inspection:
        try:
            # build the notification
            not_builder = NotificationBuilder()
            message = not_builder.build_insp_html(shakemap, name=group.template)

            #initiate message
            msg = MIMEMultipart()
            
            # attach html
            message_type = 'html' if '<html>' in message else 'plain'
            encoded_message = MIMEText(message.encode('utf-8'), message_type, 'utf-8')
            msg.attach(encoded_message)

            # get and attach shakemap
            msg_shakemap = MIMEImage(shakemap.get_map(), _subtype='jpeg')
            msg_shakemap.add_header('Content-ID', '<shakemap{0}>'.format(shakemap.shakecast_id))
            msg_shakemap.add_header('Content-Disposition', 'inline')
            msg.attach(msg_shakemap)
            
            # find the ShakeCast logo
            temp_manager = TemplateManager()
            configs = temp_manager.get_configs('inspection',
                                        name=notification.group.template)
            logo_str = os.path.join(sc_dir(),'view','assets',configs['logo'])
            
            # open logo and attach it to the message
            logo_file = open(logo_str, 'rb')
            msg_image = MIMEImage(logo_file.read())
            logo_file.close()
            msg_image.add_header('Content-ID', '<sc_logo{0}>'.format(shakemap.shakecast_id))
            msg_image.add_header('Content-Disposition', 'inline')
            msg.attach(msg_image)
            
            mailer = Mailer()
            me = mailer.me

            # get notification format
            not_format = group.get_notification_format(notification, scenario)

            # get notification destination based on notification format
            you = [user.__dict__[not_format] for user in group.users
                    if user.__dict__.get(not_format, False)]
            
            if len(you) > 0:
                subject = '{0} {1}'.format('Inspection - ', shakemap.event.title)

                if scenario is True:
                    subject = 'SCENARIO: ' + subject
                elif update is True:
                    subject = 'UPDATE: ' + subject
                    

                msg['Subject'] = subject
                msg['To'] = ', '.join(you)
                msg['From'] = me
                
                mailer.send(msg=msg, you=you)
                
                notification.status = 'sent'

            else:
                notification.status = 'not sent - no users'
        except Exception as e:
            error = str(e)
            notification.status = 'send failed'
            
    elif new_inspection:
        notification.status = 'not sent: low inspection priority'
    else:
        notification.status = 'not sent: update without impact changes'

    return {'status': notification.status,
            'error': error}

@dbconnect
def check_notification_for_group(group, notification, session=None, scenario=False):
    shakemap = notification.shakemap

    # Check that the inspection status merits a sent notification
    alert_level = shakemap.get_alert_level()

    # check if inspection list has changed
    new_inspection = True
    update = False
    if shakemap.old_maps():
        update = True
        new_inspection = False

        # get the most recent map version
        previous_map = (session.query(ShakeMap)
            .filter(ShakeMap.shakemap_id == shakemap.shakemap_id)
            .filter(ShakeMap.shakemap_version < shakemap.shakemap_version)
            .order_by(ShakeMap.shakemap_version.desc())
        ).first()

        prev_alert_level = previous_map.get_alert_level()

        # ignore changes if they don't merit inspection (grey and None)
        if (((prev_alert_level is None) and 
                (alert_level is None)) or
                ((prev_alert_level == 'gray') and
                (alert_level == 'gray'))):
            new_inspection = False

        # if overall inspection level changes, send notification
        elif prev_alert_level != alert_level:
            new_inspection = True

        # trigger new inspection if the content of the facility_shaking
        # list changes
        elif len(previous_map.facility_shaking) != len(shakemap.facility_shaking):
            new_inspection = True
        else:
            for idx in range(len(shakemap.facility_shaking)):
                if (shakemap.facility_shaking[idx].facility.facility_id !=
                        previous_map.facility_shaking[idx].facility.facility_id):
                    new_inspection = True
                    break

    return group.has_alert_level(alert_level, scenario), new_inspection, update

def download_scenario(shakemap_id=None, scenario=False):
    message = ''
    success = False
    try:
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
    except Exception as e:
        message = str(e)

    return {'status': status,
            'message': {'from': 'scenario_download',
                        'title': 'Scenario Download Finished',
                        'message': message,
                        'success': success},
            'log': 'Download scenario: ' + shakemap_id + ', ' + status}

@dbconnect
def delete_scenario(shakemap_id=None, session=None):
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

@dbconnect
def run_scenario(shakemap_id=None, session=None):
    '''
    Processes a shakemap as if it were new
    '''
    error = None

    # Check if we have the eq in db
    event = session.query(Event).filter(Event.event_id == shakemap_id).first()
    shakemap = session.query(ShakeMap).filter(ShakeMap.shakemap_id == shakemap_id).first()
    try:
        if event:
            process_events(events=[event],
                            session=session,
                            scenario=True)

        if shakemap:
            process_shakemaps(shakemaps=[shakemap],
                                session=session,
                                scenario=True)

        message = 'Scenario run complete'

    except Exception as e:
        error = str(e)
        message = 'Scenario run failed'

        
    if event is None and shakemap is None:
        error = 'No events available for this event id'
    
    return {'status': 'finished',
            'message': {'from': 'scenario_run',
                        'title': 'Scenario: {}'.format(shakemap_id),
                        'message': message,
                        'success': error is None},
            'error': error,
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

def check_for_updates():
    '''
    Hits the USGS github for ShakeCast to determine if there are
    updates. If there are new updates, the software updater will
    email admin users to alert them
    '''
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
######################## Import Inventory Data ########################

def import_master_xml(xml_file='', _user=None):
    '''
    Import an XML file created by the ShakeCast workbook; Facilities, Groups, and Users
    
    Args:
        xml_file (string): The filepath to the xml_file that will be uploaded
        _user (int): User id of admin making inventory changes
        
    Returns:
        dict: a dictionary that contains information about the function run
        ::
            data = {'status': either 'finished' or 'failed',
                    'message': message to be returned to the UI,
                    'log': message to be added to ShakeCast log
                           and should contain info on error}
    '''
    fac_list = []
    group_list = []
    user_list = []
    with open(xml_file, 'r') as xml_str:
        xml_dict = json.loads(json.dumps(xmltodict.parse(xml_str)))
        fac_list = xml_dict['Inventory']['FacilityTable']['FacilityRow']
        group_list = xml_dict['Inventory']['GroupTable']['GroupRow']
        user_list = xml_dict['Inventory']['UserTable']['UserRow']
        if isinstance(fac_list, list) is False:
            fac_list = [fac_list]
        if isinstance(group_list, list) is False:
            group_list = [group_list]
        if isinstance(user_list, list) is False:
            user_list = [user_list]
    
    fac_data = import_facility_dicts(facs=fac_list, _user=_user)
    group_data = import_group_dicts(groups=group_list, _user=_user)
    user_data = import_user_dicts(users=user_list, _user=_user)

    message = '{}\n{}\n{}'.format(fac_data['message']['message'],
                                    group_data['message']['message'],
                                    user_data['message']['message'])

    log_message = ''
    status = 'finished'
    data = {'status': status,
            'message': {'from': 'master_import',
                        'title': 'Imported Master XML',
                        'message': message,
                        'success': True},
            'log': log_message}
    return data

def import_facility_xml(xml_file='', _user=None):
    '''
    Import an XML file created by the ShakeCast workbook; Facilities
    
    Args:
        xml_file (string): The filepath to the xml_file that will be uploaded
        _user (int): User id of admin making inventory changes
        
    Returns:
        dict: a dictionary that contains information about the function run
        ::
            data = {'status': either 'finished' or 'failed',
                    'message': message to be returned to the UI,
                    'log': message to be added to ShakeCast log
                           and should contain info on error}
    '''
    xml_list = []
    with open(xml_file, 'r') as xml_str:
        xml_dict = json.loads(json.dumps(xmltodict.parse(xml_str)))
        xml_list = xml_dict['FacilityTable']['FacilityRow']
        if isinstance(xml_list, list) is False:
            xml_list = [xml_list]
    
    data = import_facility_dicts(facs=xml_list, _user=_user)
    
    return data

@dbconnect
def import_facility_dicts(facs=None, _user=None, session=None):
    '''
    Import a list of dicts containing facility info
    
    Args:
        facs (list): facility dictionaries
        _user (int): User id of admin making inventory changes
        
    Returns:
        dict: a dictionary that contains information about the function run
        ::
            data = {'status': either 'finished' or 'failed',
                    'message': message to be returned to the UI,
                    'log': message to be added to ShakeCast log
                           and should contain info on error}
    '''
    
    if isinstance(_user, int):
        _user = session.query(User).filter(User.shakecast_id == _user).first()
    
    if facs is not None:
        count_dict = {}
        for fac in facs:
            
            # data validation
            if fac.get('EXTERNAL_FACILITY_ID', None) is None:
                continue

            existing = (session.query(Facility)
                            .filter(Facility.facility_id == str(fac['EXTERNAL_FACILITY_ID']))
                            .filter(Facility.component == fac['COMPONENT'])
                            .filter(Facility.component_class == fac['COMPONENT_CLASS'])
                            .all())
            if existing:
                for f in existing:
                    session.delete(f)

            f = Facility()
            f.facility_id = fac.get('EXTERNAL_FACILITY_ID', None)
            f.facility_type = fac.get('FACILITY_TYPE', None)
            f.component = fac.get('COMPONENT', 'SYSTEM')
            f.component_class = fac.get('COMPONENT_CLASS', 'SYSTEM')
            f.name = fac.get('FACILITY_NAME', None)
            f.description = fac.get('DESCRIPTION', None)
            f.short_name = fac.get('SHORT_NAME', None)
            f.model = fac.get('FACILITY_MODEL', None)

            if fac.get('FEATURE', None) is not None:
                f.geom_type = fac['FEATURE'].get('GEOM_TYPE', None)
                f.html = fac['FEATURE'].get('DESCRIPTION', None)
                f.geom = fac['FEATURE'].get('GEOM', None)

            if fac.get('FRAGILITY', None) is not None:
                gray = 'GRAY'
                if fac['FRAGILITY'].get('GRAY', None) is None:
                    gray = 'GREY'

                if fac['FRAGILITY'].get(gray, None) is not None:
                    f.gray = fac['FRAGILITY'][gray].get('ALPHA', None)
                    f.gray_beta = fac['FRAGILITY'][gray].get('BETA', None)
                    f.gray_metric = fac['FRAGILITY'][gray].get('METRIC', None)
                if fac['FRAGILITY'].get('GREEN', None) is not None:
                    f.green = fac['FRAGILITY']['GREEN'].get('ALPHA', None)
                    f.green_beta = fac['FRAGILITY']['GREEN'].get('BETA', None)
                    f.green_metric = fac['FRAGILITY']['GREEN'].get('METRIC', None)
                if fac['FRAGILITY'].get('YELLOW', None) is not None:
                    f.yellow = fac['FRAGILITY']['YELLOW'].get('ALPHA', None)
                    f.yellow_beta = fac['FRAGILITY']['YELLOW'].get('BETA', None)
                    f.yellow_metric = fac['FRAGILITY']['YELLOW'].get('METRIC', None)
                if fac['FRAGILITY'].get('ORANGE', None) is not None:
                    f.orange = fac['FRAGILITY']['ORANGE'].get('ALPHA', None)
                    f.orange_beta = fac['FRAGILITY']['ORANGE'].get('BETA', None)
                    f.orange_metric = fac['FRAGILITY']['ORANGE'].get('METRIC', None)
                if fac['FRAGILITY'].get('RED', None) is not None:
                    f.red = fac['FRAGILITY']['RED'].get('ALPHA', None)
                    f.red_beta = fac['FRAGILITY']['RED'].get('BETA', None)
                    f.red_metric = fac['FRAGILITY']['RED'].get('METRIC', None)
                    f.metric = fac['FRAGILITY']['RED'].get('METRIC', None)

            f.updated = time.time()
            if _user is not None:
                f.updated_by = _user.username

            if f.geom_type and f.geom:
                # manipulate geometry
                if f.geom_type == 'POINT':
                    point = f.geom.split(',')
                    lon = float(point[0])
                    lat = float(point[1])
                    
                    f.lon_min = lon - .01
                    f.lon_max = lon + .01
                    f.lat_min = lat - .01
                    f.lat_max = lat + .01
                    
                elif f.geom_type == 'POLYGON':
                    points = [p.split(',') for p in f.geom.split(';')]
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

        session.commit()
        add_facs_to_groups(session=session)
        session.commit()

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

def import_group_xml(xml_file='', _user=None):
    '''
    Import an XML file created by the ShakeCast workbook; Groups
    
    Args:
        xml_file (string): The filepath to the xml_file that will be uploaded
        _user (int): User id of admin making inventory changes

        
    Returns:
        dict: a dictionary that contains information about the function run
        ::
            data = {'status': either 'finished' or 'failed',
                    'message': message to be returned to the UI,
                    'log': message to be added to ShakeCast log
                           and should contain info on error}
    '''

    xml_list = []
    with open(xml_file, 'r') as xml_str:
        xml_dict = json.loads(json.dumps(xmltodict.parse(xml_str)))
        xml_list = xml_dict['GroupTable']['GroupRow']
        if isinstance(xml_list, list) is False:
            xml_list = [xml_list]
    
    data = import_group_dicts(groups=xml_list, _user=_user)
    return data

@dbconnect
def import_group_dicts(groups=None, _user=None, session=None):
    '''
    Import a list of dicts containing group info
    
    Args:
        groups (list): group dictionaries
        _user (int): User id of admin making inventory changes
        
    Returns:
        dict: a dictionary that contains information about the function run
        ::
            data = {'status': either 'finished' or 'failed',
                    'message': message to be returned to the UI,
                    'log': message to be added to ShakeCast log
                           and should contain info on error}
    '''
    
    if isinstance(_user, int):
        _user = session.query(User).filter(User.shakecast_id == _user).first()
    
    imported_groups = []
    if groups is not None:
        for group in groups:
            name = group.get('GROUP_NAME', None)
            poly = group.get('POLY', None)

            if poly is not None:
                # split up the monitoring region
                split_poly = re.split('\s|;|,', poly)
                split_poly = filter(None, split_poly)

            # try to get the group if it exists
            gs = session.query(Group).filter(Group.name == name).all()
            if gs:
                g = gs[0]
            else:
                g = Group()
                g.name = name
                
                # check requirements for group and exit if not met
                if (name == '' or
                        len(split_poly) % 2 != 0 or
                        len(split_poly) < 6):
                    continue
            
                session.add(g)

            g.facility_type = group.get('FACILITY_TYPE', None)
            g.template = group.get('TEMPLATE', 'DEFAULT')
            g.updated = time.time()
            if _user is not None:
                g.updated_by = _user.username

            if g.name not in imported_groups:
                imported_groups += [g.name]

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
            
            session.add(g)
            if group.get('NOTIFICATION', None) is not None:
                notification_type = group['NOTIFICATION'].get('NOTIFICATION_TYPE', None)
                damage_level = group['NOTIFICATION'].get('DAMAGE_LEVEL', None)

                # look for existing specs
                if group['NOTIFICATION']['NOTIFICATION_TYPE'] == 'NEW_EVENT':
                    spec = (session.query(GroupSpecification)
                                .filter(GroupSpecification.notification_type == 'NEW_EVENT')
                                .filter(GroupSpecification.group == g)).all()
                else:
                    damage_level = group['NOTIFICATION'].get('DAMAGE_LEVEL', None)
                    spec = (session.query(GroupSpecification)
                                .filter(GroupSpecification.notification_type == 'DAMAGE')
                                .filter(GroupSpecification.inspection_priority == damage_level)
                                .filter(GroupSpecification.group == g)).all()
                if spec:
                    spec = spec[0]

                else:
                    spec = GroupSpecification()
                    spec.notification_type = notification_type
                    if damage_level:
                        spec.damage_level= damage_level
                        
                    g.specs += [spec]
                
                if damage_level is not None:
                    spec.inspection_priority = damage_level
                            
                spec.minimum_magnitude = group['NOTIFICATION'].get('LIMIT_VALUE', None)
                spec.notification_format = group['NOTIFICATION'].get('MESSAGE_FORMAT', None)
                spec.aggregate_group = group['NOTIFICATION'].get('AGGREGATE_GROUP', None)
                spec.event_type = group['NOTIFICATION'].get('EVENT_TYPE', None)
    
    add_facs_to_groups(session=session)
    add_users_to_groups(session=session)
    session.commit()

    log_message = ''
    status = 'finished'
    data = {'status': status,
            'message': {'title': 'Group Upload',
                        'message': imported_groups,
                        'success': True},
            'log': log_message,
            'success': True}
    return data

def import_user_xml(xml_file='', _user=None):
    '''
    Import an XML file created by the ShakeCast workbook; Users
    
    Args:
        xml_file (string): The filepath to the xml_file that will be uploaded
        _user (int): User id of admin making inventory changes
        
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

    data = import_user_dicts(user_list, _user)
    
    return data

@dbconnect
def import_user_dicts(users=None, _user=None, session=None):
    '''
    Import a list of dicts containing user info
    
    Args:
        users (list): user dictionaries
        _user (int): User id of admin making inventory changes
        
    Returns:
        dict: a dictionary that contains information about the function run
        ::
            data = {'status': either 'finished' or 'failed',
                    'message': message to be returned to the UI,
                    'log': message to be added to ShakeCast log
                           and should contain info on error}
    '''
    
    if isinstance(_user, int):
        _user = session.query(User).filter(User.shakecast_id == _user).first()
    
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
            u.user_type = user.get('USER_TYPE', user.get('user_type', ''))
            u.full_name = user.get('FULL_NAME', user.get('full_name', ''))
            u.phone_number = user.get('PHONE_NUMBER', user.get('phone_number', ''))

            delivery = user.get('DELIVERY', user.get('delivery', False))
            if delivery:
                u.mms = delivery.get('MMS',
                            delivery.get('mms',
                            delivery.get('PAGER',
                            delivery.get('pager', ''))))
                    
            u.updated = time.time()
            if _user is not None:
                if u.updated_by is None:
                    u.updated_by = _user.username
                elif _user.username not in u.updated_by:
                    updated_lst = u.updated_by.split(',')
                    updated_lst += [_user.username]
                    u.updated_by = ','.join(updated_lst)

            # set the user's password and email if they haven't changed it
            # themselves
            if (u.updated_by is None or 
                        _user is None or 
                        u.username not in u.updated_by or 
                        _user.username == u.username):
                u.email = user.get('EMAIL_ADDRESS', user.get('email', ''))
                password = user.get('PASSWORD', user.get('password', None))
                if password is not None:
                    u.password = generate_password_hash(password, method='pbkdf2:sha512')

            session.add(u)
        session.commit()
        add_users_to_groups(session=session)
        session.commit()

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
    '''
    Determine what type of XML file this is; facility, group, 
    user, master, or unknown
    '''
    tree = ET.parse(xml_file)
    root = tree.getroot()
    
    xml_type = ''
    if 'FacilityTable' in str(root):
        xml_type = 'facility'
    elif 'GroupTable' in str(root):
        xml_type = 'group'
    elif 'UserTable' in str(root):
        xml_type = 'user'
    elif 'Inventory' in str(root):
        xml_type = 'master'
    else:
        xml_type = 'unknown'
        
    return xml_type

@dbconnect
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
        query = session.query(Facility).filter(Facility.in_grid(group))
        if ((group.facility_type is not None) and
                (group.facility_type.lower() != 'all')):
            query = query.filter(Facility.facility_type.like(group.facility_type))

        group.facilities = query.all()

@dbconnect
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

@dbconnect
def delete_inventory_by_id(inventory_type=None, ids=None, session=None):
    '''
    Function made to be run by the ShakeCast server deletes facilities
    by their shakecast_id
    inventory types: facility, group, user, earthquake
    '''
    deleted = []
    if inventory_type is not None and ids is not None:
        if inventory_type == 'facility':
            plural = 'facilities'
            inv_table = Facility
        elif inventory_type == 'group':
            plural = 'groups'
            inv_table = Group
        elif inventory_type == 'user':
            plural = 'users'
            inv_table = User

        inventory = session.query(inv_table).filter(inv_table
                                            .shakecast_id
                                            .in_(ids)).all()
        # delete inventory
        for inv in inventory:
            session.delete(inv)
            deleted += [inv]

            if len(deleted) > 1:
                inventory_type = plural
        session.commit()

    data = {'status': 'finished',
            'message': {'from': 'delete_inventory',
                        'title': 'Deleted Inventory',
                        'message': 'Removed {} {}'.format(len(deleted), inventory_type),
                        'success': True},
            'log': ''}
    
    return data

    return {'status': 'finished', 'message': deleted}


@dbconnect
def get_facility_info(group_name='', shakemap_id='', session=None):
    '''
    Get facility overview (Facilities per facility type) for a 
    specific group or shakemap or both or none
    '''
    f_types = session.query(Facility.facility_type).distinct().all()

    f_dict = {}
    for f_type in f_types:

        query = session.query(Facility)
        if group_name:
            query = query.filter(Facility.groups.any(Group.name == group_name))
        if shakemap_id:
            query = (query.filter(Facility.shaking_history
                                    .any(FacilityShaking.shakemap
                                            .has(shakemap_id=shakemap_id))))

        query = query.filter(Facility.facility_type == f_type[0])
        count = query.count()
        if count > 0:
            f_dict[f_type[0]] = count

    return f_dict

def get_event_impact(shakemap):
    impact_sum = {'gray': 0,
             'green': 0,
             'yellow': 0,
             'orange': 0,
             'red': 0}

    fac_shaking = shakemap.facility_shaking
    
    for s in fac_shaking:
        # record number of facs at each alert level
        impact_sum[s.alert_level] += 1

    return impact_sum




#######################################################################
########################## TEST FUNCTIONS #############################

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
    you = 'test@gmail.com'
    msg = MIMEText('This email is a test of your ShakeCast SMTP server')
    msg['Subject'] = 'ShakeCast SMTP TEST'
    msg['From'] = m.me
    msg['To'] = you
    m.send(msg=msg, you=you)

def system_test(add_tests=None):
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

    Session.remove()

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

def sql_to_obj(sql):
    '''
    Convert SQLAlchemy objects into dictionaries for use after
    session closes
    '''

    if isinstance(sql, Base):
        sql = sql.__dict__

    if isinstance(sql, list):
        obj = []

        for item in sql:
            if (isinstance(item, dict) or
                    isinstance(item, list) or
                    isinstance(item, Base)):
                obj.append(sql_to_obj(item))

    elif isinstance(sql, dict):
        obj = {}

        if sql.get('_sa_instance_state', False):
            sql.pop('_sa_instance_state')

        for key in sql.keys():
            item = sql[key]
            if isinstance(item, Base) or isinstance(item, dict):
                item = sql_to_obj(item)
            
            elif isinstance(item, list):
                for obj in item:
                    if isinstance(obj, Base):
                        item = sql_to_obj(item)
            
            obj[key] = item

    else:
        obj = sql

    return obj