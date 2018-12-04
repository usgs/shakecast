import itertools
import time

from grid import create_grid
from impact import get_event_impact, make_inspection_priority
from jsonencoders import makeImpactGeoJSONDict, saveImpactGeoJson
from orm import (
    dbconnect,
    Event,
    Facility,
    FacilityShaking,
    Group,
    Notification,
    ShakeMap
)
import pdf
from util import Clock, SC

from notifications import new_event_notification, inspection_notification

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
        if shakemap.begin_timestamp is None:
            shakemap.begin_timestamp = time.time()
        else:
            shakemap.superceded_timestamp = time.time()

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
            shakemap.end_timestamp = time.time()

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
        
        shakemap.end_timestamp = time.time()
        session.commit()

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