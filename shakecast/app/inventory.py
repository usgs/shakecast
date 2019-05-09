import json
import os
import re
import shutil
import time
from sqlalchemy import or_
from werkzeug.security import generate_password_hash
import xml.etree.ElementTree as ET
import xmltodict

from orm import (
    Aebm,
    Attribute,
    dbconnect,
    Event,
    Facility,
    FacilityShaking,
    Group,
    GroupSpecification,
    User,
    ShakeMap
)

def get_facility_dicts_from_xml(xml_str):
    xml_dict = json.loads(json.dumps(xmltodict.parse(xml_str)))
    facility_list = xml_dict['FacilityTable']['FacilityRow']
    if isinstance(facility_list, list) is False:
        facility_list = [facility_list]
    
    return facility_list

def get_group_dicts_from_xml(xml_str):
    xml_dict = json.loads(json.dumps(xmltodict.parse(xml_str)))
    group_list = xml_dict['GroupTable']['GroupRow']
    if isinstance(group_list, list) is False:
        group_list = [group_list]
    
    return group_list

def get_user_dicts_from_xml(xml_str):
    user_xml_dict = json.loads(json.dumps(xmltodict.parse(xml_str)))
    user_list = user_xml_dict['UserTable']['UserRow']
    if isinstance(user_list, list) is False:
        user_list = [user_list]
    
    return user_list

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
    with open(xml_file, 'r') as xml_file:
        xml_list = get_facility_dicts_from_xml(xml_file.read())
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

            facility = Facility()
            facility.facility_id = fac.get('EXTERNAL_FACILITY_ID', None)
            facility.facility_type = fac.get('FACILITY_TYPE', None)
            facility.component = fac.get('COMPONENT', 'SYSTEM')
            facility.component_class = fac.get('COMPONENT_CLASS', 'SYSTEM')
            facility.name = fac.get('FACILITY_NAME', None)
            facility.description = fac.get('DESCRIPTION', None)
            facility.short_name = fac.get('SHORT_NAME', None)
            facility.model = fac.get('FACILITY_MODEL', None)

            if fac.get('FEATURE', None) is not None:
                facility.geom_type = fac['FEATURE'].get('GEOM_TYPE', None)
                facility.html = fac['FEATURE'].get('DESCRIPTION', None)
                facility.geom = fac['FEATURE'].get('GEOM', None)

            if fac.get('FRAGILITY', None) is not None:
                gray = 'GRAY'
                if fac['FRAGILITY'].get('GRAY', None) is None:
                    gray = 'GREY'

                if fac['FRAGILITY'].get(gray, None) is not None:
                    facility.gray = fac['FRAGILITY'][gray].get('ALPHA', None)
                    facility.gray_beta = fac['FRAGILITY'][gray].get('BETA', None)
                    facility.gray_metric = fac['FRAGILITY'][gray].get('METRIC', None)
                if fac['FRAGILITY'].get('GREEN', None) is not None:
                    facility.green = fac['FRAGILITY']['GREEN'].get('ALPHA', None)
                    facility.green_beta = fac['FRAGILITY']['GREEN'].get('BETA', None)
                    facility.green_metric = fac['FRAGILITY']['GREEN'].get('METRIC', None)
                if fac['FRAGILITY'].get('YELLOW', None) is not None:
                    facility.yellow = fac['FRAGILITY']['YELLOW'].get('ALPHA', None)
                    facility.yellow_beta = fac['FRAGILITY']['YELLOW'].get('BETA', None)
                    facility.yellow_metric = fac['FRAGILITY']['YELLOW'].get('METRIC', None)
                if fac['FRAGILITY'].get('ORANGE', None) is not None:
                    facility.orange = fac['FRAGILITY']['ORANGE'].get('ALPHA', None)
                    facility.orange_beta = fac['FRAGILITY']['ORANGE'].get('BETA', None)
                    facility.orange_metric = fac['FRAGILITY']['ORANGE'].get('METRIC', None)
                if fac['FRAGILITY'].get('RED', None) is not None:
                    facility.red = fac['FRAGILITY']['RED'].get('ALPHA', None)
                    facility.red_beta = fac['FRAGILITY']['RED'].get('BETA', None)
                    facility.red_metric = fac['FRAGILITY']['RED'].get('METRIC', None)
                    facility.metric = fac['FRAGILITY']['RED'].get('METRIC', None)

            facility.aebm = parse_aebm_from_xml_dict(fac.get('AEBM', None))
            facility.attributes = parse_attributes_from_xml(fac.get('ATTRIBUTE', None))
                

            facility.updated = time.time()
            if _user is not None:
                facility.updated_by = _user.username

            if facility.geom_type and facility.geom:
                # manipulate geometry
                if facility.geom_type == 'POINT':
                    point = facility.geom.split(',')
                    lon = float(point[0])
                    lat = float(point[1])
                    
                    facility.lon_min = lon - .01
                    facility.lon_max = lon + .01
                    facility.lat_min = lat - .01
                    facility.lat_max = lat + .01
                    
                elif facility.geom_type == 'POLYGON':
                    points = [p.split(',') for p in facility.geom.split(';')]
                    lons = [pnt[0] for pnt in points]
                    lats = [pnt[1] for pnt in points]
                    
                    facility.lon_min = min(lons)
                    facility.lon_max = max(lons)
                    facility.lat_min = min(lats)
                    facility.lat_max = max(lats)
                    
                elif facility.geom_type == 'POLYLINE':
                    pass
                
                session.add(facility)

                if count_dict.get(facility.facility_type, False) is False:
                    count_dict[facility.facility_type] = 1
                else:
                    count_dict[facility.facility_type] += 1

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

    with open(xml_file, 'r') as xml_file:
        xml_list = get_group_dicts_from_xml(xml_file.read())
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
        user_list = get_user_dicts_from_xml(xml_str.read())
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
            
            facility_types = group.facility_type.split(',')
            query = query.filter(
                    or_(*[Facility.facility_type.like(fac_type)
                    for fac_type in facility_types]))

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


def parse_aebm_from_xml_dict(aebm_xml_dict):
    '''
    If available, create an AEBM orm object for facility
    '''
    aebm = None
    if aebm_xml_dict and aebm_xml_dict.get('AEBM', False):
        aebm = Aebm(
            mbt = aebm_xml_dict.get('MBT', None),
            sdl = aebm_xml_dict.get('SDL', None),
            bid = aebm_xml_dict.get('BID', None),
            height = aebm_xml_dict.get('HEIGHT', None),
            stories = aebm_xml_dict.get('STORIES', None),
            year = aebm_xml_dict.get('YEAR', None),
            performance_rating = aebm_xml_dict.get('PERFORMANCE_RATING', None),
            quality_rating = aebm_xml_dict.get('QUALITY_RATING', None),
            elastic_period = aebm_xml_dict.get('ELASTIC_PERIOD', None),
            elastic_damping = aebm_xml_dict.get('ELASTIC_DAMPING', None),
            design_period = aebm_xml_dict.get('DESIGN_PERIOD', None),
            ultimate_period = aebm_xml_dict.get('ULTIMATE_PERIOD', None),
            design_coefficient = aebm_xml_dict.get('DESIGN_COEFFICIENT', None),
            modal_weight = aebm_xml_dict.get('MODAL_WEIGHT', None),
            modal_height = aebm_xml_dict.get('MODAL_HEIGHT', None),
            modal_response = aebm_xml_dict.get('MODAL_RESPONSE', None),
            pre_yield = aebm_xml_dict.get('PRE_YIELD', None),
            post_yield = aebm_xml_dict.get('POST_YIELD', None),
            max_strength = aebm_xml_dict.get('MAX_STRENGTH', None),
            ductility = aebm_xml_dict.get('DUCTILITY', None),
            default_damage_state_beta = aebm_xml_dict.get('DAMAGE_STATE_BETA', None)
        )
    return aebm

def parse_attributes_from_xml(attributes):
    if attributes is None:
        return []

    attribute_lst= []
    for key in attributes.keys():
        attribute = Attribute(
            name=key,
            value=attributes[key]
        )

        attribute_lst += [attribute]
    
    return attribute_lst


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