from sc.app.orm import Facility, Group, GroupSpecification, User
def create_fac(grid=None, fac_id='AUTO_GENERATED'):
    '''
    Create a facility that is inside of a grid with generic fragility
    '''
    
    facility = Facility()
    if grid:
        lat_adjust = abs((grid.lat_max - grid.lat_min) / 10)
        lon_adjust = abs((grid.lon_max - grid.lon_min) / 10)
        facility.lat_min = grid.lat_min + lat_adjust
        facility.lat_max = facility.lat_min + (2 * lat_adjust)
        facility.lon_min = grid.lon_min + lon_adjust
        facility.lon_max = facility.lon_min + (2 * lon_adjust)
    
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
    
def create_group(name=None, 
                    event_type='ACTUAL',
                    notification_format=None,
                    new_event=True,
                    heartbeat=True,
                    insp_prios=['GREY', 
                                'GREEN', 
                                'YELLOW', 
                                'ORANGE', 
                                'RED']):
    group = Group()
    group.name = name
    group.facility_type = 'All'
    group.lon_min = -180
    group.lon_max = 180
    group.lat_min = -90
    group.lat_max = 90
    
    if new_event is True:
        gs = GroupSpecification()
        gs.event_type = event_type
        gs.notification_type = 'NEW_EVENT'
        gs.minimum_magnitude = 3
        gs.notification_format = notification_format
        group.specs.append(gs)
    
    if heartbeat is True:
        gs = GroupSpecification()
        gs.event_type = event_type
        gs.notification_type = 'new_event'
        gs.notification_format = notification_format
        gs.event_type = 'heartbeat'
        group.specs.append(gs)
    
    for insp_prio in insp_prios:
        gs = GroupSpecification()
        gs.event_type = event_type
        gs.notification_type = 'DAMAGE'
        gs.minimum_magnitude = 3
        gs.notification_format = notification_format
        gs.inspection_priority = insp_prio
        group.specs.append(gs)

    return group

def create_user(group_str=None, email=None, mms=None):
    user = User()
    user.username = 'test_user'
    user.email = email
    user.mms = mms
    user.user_type = 'ADMIN'
    user.group_string = group_str

    return user