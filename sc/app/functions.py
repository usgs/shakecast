from email.mime.text import MIMEText
from email.mime.image import MIMEImage
from email.mime.multipart import MIMEMultipart
from email.mime.application import MIMEApplication
import itertools
import re
import shutil
import sys
import time

from grid import ShakeMapGrid
from inventory import (
    import_facility_dicts,
    import_facility_xml,
    import_group_dicts,
    import_group_xml,
    import_master_xml,
    import_user_dicts,
    import_user_xml,
    determine_xml,
    delete_inventory_by_id,
    get_facility_info
)
from orm import *
import pdf
from jsonencoders import AlchemyEncoder, makeImpactGeoJSONDict, saveImpactGeoJson
from notifications import NotificationBuilder, TemplateManager, Mailer
from productgrabber import ProductGrabber
from urlopener import URLOpener
from updates import SoftwareUpdater
from util import *


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

                geoJSON['features'][f_count] = makeImpactGeoJSONDict(facility,
                                                                fac_shaking)

                f_count += 1

            # Remove all old shaking and add all fac_shaking_lst
            shakemap.facility_shaking = []
            session.commit()

            session.bulk_save_objects(fac_shaking_lst)
            session.commit()

            geoJSON['properties']['impact-summary'] = get_event_impact(shakemap)

            saveImpactGeoJson(shakemap, geoJSON)

            # get and attach pdf
            pdf.generate_impact_pdf(shakemap, save=True)
    
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
            #initiate message
            msg = MIMEMultipart()

            # build the notification
            not_builder = NotificationBuilder()
            message = not_builder.build_insp_html(shakemap, name=group.template)

            # attach html
            message_type = 'html' if '<html>' in message else 'plain'
            encoded_message = MIMEText(message.encode('utf-8'), message_type, 'utf-8')
            msg.attach(encoded_message)

            # check for pdf
            pdf_location = os.path.join(shakemap.directory_name, 'impact.pdf')
            if (os.path.isfile(pdf_location)):
                with open(pdf_location, 'rb') as pdf_file:
                    attach_pdf = MIMEApplication(pdf_file.read(), _subtype='pdf')
                    attach_pdf.add_header('Content-Disposition', 'attachment', filename='impact.pdf')
                    msg.attach(attach_pdf)

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