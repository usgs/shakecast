from app.objects import AlchemyEncoder
from app.util import *
import os
import sys
import io
import json
modules_dir = os.path.join(sc_dir(), 'modules')
if modules_dir not in sys.path:
    sys.path += [modules_dir]

from flask import Flask, render_template, url_for, request, session, flash, redirect, send_file, send_from_directory, Response, jsonify
from flask_login import LoginManager, login_user, logout_user, current_user, login_required
from flask_uploads import UploadSet, configure_uploads, IMAGES
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps
import time
import datetime
from ast import literal_eval
from app.objects import Clock, SC, NotificationBuilder, TemplateManager, SoftwareUpdater
from app.orm import *
from app.functions import determine_xml, get_facility_info
from ui import UI

# setup logging
import logging
log = logging.getLogger('werkzeug')
log.setLevel(logging.ERROR)

BASE_DIR = os.path.join(sc_dir(),'view')
STATIC_DIR = os.path.join(sc_dir(),'view','static')
app = Flask(__name__,
            template_folder=BASE_DIR,
            static_folder=STATIC_DIR)

################################ Login ################################

app.secret_key = 'super secret key'
app.config['SESSION_TYPE'] = 'filesystem'
app.json_encoder = AlchemyEncoder
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'index'

# send Angular 2 files
@app.route('/<path:filename>')
def client_app_angular2_folder(filename):
    return send_from_directory(os.path.join(BASE_DIR), filename)

@login_manager.user_loader
def load_user(user_id):
    session = Session()
    user = session.query(User).filter(User.shakecast_id==int(user_id)).first()

    # Expunge here might help with Windows threading
    #session.expunge(user)
    Session.remove()
    return user

@app.route('/api/login', methods=['POST'])
def login():
    if request.method == 'GET':
        return render_template('login.html')

    session = Session()
    username = request.json.get('username', '')
    password = request.json.get('password', '')
    
    registered_user = (session.query(User)
                            .filter(and_(User.username==username)).first())
    
    if (registered_user is None or not
            check_password_hash(registered_user.password, password)):
        Session.remove()
        return jsonify(success=False)

    login_user(registered_user)
    flash('Logged in successfully')
    Session.remove()

    user = current_user.__dict__.copy()
    user.pop('_sa_instance_state', None)
    return jsonify(success=True, isAdmin=current_user.is_admin(), **user)

@app.route('/logged_in')
def logged_in():
    try:
        is_admin = current_user.is_admin()
    except Exception:
        is_admin = false
    return jsonify(success=True, 
                   loggedIn=bool(current_user.is_authenticated),
                   isAdmin=bool(is_admin))

@app.route('/logout')
def logout():
    logout_user()
    return jsonify(success=True)

############################# User Domain #############################

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/messages')
@login_required
def get_messages():
    fname = os.path.join(sc_dir(), 'app', 'server-messages.json')
    
    # ignore if file doesn't exist
    if os.path.isfile(fname):
        with open(fname) as file_:
            messages = file_.read()
    else:
        messages = '{}'

    return messages

@app.route('/api/earthquake-data')
@login_required
def get_eq_data():
    session = Session()
    filter_ = json.loads(request.args.get('filter', '{}'))
    DAY = 24*60*60
    query = session.query(Event)
    
    if filter_:
        if filter_.get('group', None):
            query = query.filter(Event.groups.any(Group.name.like(filter_['group'])))
        if filter_.get('latMax', None):
            query = query.filter(Event.lat < float(filter_['latMax']))
        if filter_.get('latMin', None):
            query = query.filter(Event.lat > float(filter_['latMin']))
        if filter_.get('lonMax', None):
            query = query.filter(Event.lon < float(filter_['lonMax']))
        if filter_.get('lonMin', None):
            query = query.filter(Event.lon > float(filter_['lonMin']))

        if filter_.get('timeframe', None):
            timeframe = filter_.get('timeframe')
            if timeframe == 'day':
                query = query.filter(Event.time > time.time() - DAY)
            elif timeframe == 'week':
                query = query.filter(Event.time > time.time() - 7*DAY)    
            elif timeframe == 'month':
                query = query.filter(Event.time > time.time() - 31*DAY)    
            elif timeframe == 'year':
                query = query.filter(Event.time > time.time() - 365*DAY)

        if filter_.get('scenario', None) is True:
            query = query.filter(Event.status == 'scenario')
        else:
            query = query.filter(Event.status != 'scenario')
        
        if filter_.get('shakemap', False) is True:
            query = query.filter(Event.shakemaps)

        if filter_.get('facility', None):
            query = (query.filter(ShakeMap
                                    .facility_shaking
                                    .any(FacilityShaking
                                            .facility_id == filter_['facility']['shakecast_id'])))

    # get the time of the last earthquake in UI,
    # should be 0 for a new request
    eq_time = float(request.args.get('time', 0))
    if eq_time < 1:
        eq_time = time.time()
        
    eqs = (query.filter(Event.time < eq_time)
                .filter(Event.event_id != 'heartbeat')
                .order_by(Event.time.desc())
                .limit(50)
                .all())
    
    eq_dicts = []
    for eq in eqs:
        eq_dict = eq.__dict__.copy()
        eq_dict['shakemaps'] = len(eq.shakemaps)
        eq_dict.pop('_sa_instance_state', None)
        eq_dicts += [eq_dict]
    
    Session.remove()
    return jsonify(success=True, data=eq_dicts)

@app.route('/api/earthquake-data/facility/<facility_id>')
@login_required
def get_shaking_events(facility_id):
    session = Session()
    fac = session.query(Facility).filter(Facility.shakecast_id == facility_id).first()
    eqs = [fs.shakemap.event for fs in fac.shaking_history if fs.shakemap is not None]

    eq_dicts = []
    for eq in eqs:
        if eq is not None:
            eq_dict = eq.__dict__.copy()
            eq_dict['shakemaps'] = len(eq.shakemaps)
            eq_dict.pop('_sa_instance_state', None)
            eq_dicts += [eq_dict]
    
    Session.remove()
    return jsonify(success=True, data=eq_dicts)

@app.route('/api/facility-data')
@login_required
def get_fac_data():
    session = Session()
    filter_ = json.loads(request.args.get('filter', '{}'))
    query = session.query(Facility)

    if filter_:
        if filter_.get('group', None) is not None:
            query = query.filter(Facility.groups.any(Group.name.like(filter_['group'])))
        if filter_.get('latMax', None) is not None:
            query = query.filter(Facility.lat_min < float(filter_['latMax']))
        if filter_.get('latMin', None) is not None:
            query = query.filter(Facility.lat_max > float(filter_['latMin']))
        if filter_.get('lonMax', None) is not None:
            query = query.filter(Facility.lon_min < float(filter_['lonMax']))
        if filter_.get('lonMin', None) is not None:
            query = query.filter(Facility.lon_max > float(filter_['lonMin']))
        if filter_.get('facility_type', None) is not None:
            query = query.filter(Facility.facility_type.like(filter_['facility_type']))
        if filter_.get('keywords', None) is not None:

            keys_raw = filter_['keywords'].lower().split(',')
            keys = [key.strip(' ') for key in keys_raw]

            key_filter = [or_(literal(key).contains(func.lower(Facility.name)),
                                            func.lower(Facility.name).contains(key),
                                            func.lower(Facility.description).contains(key)) for key in keys]
            query = query.filter(and_(*key_filter))

    if filter_.get('count', None) is None:
        facs = query.limit(50).all()
    else:
        all_facs = query.all()

        if len(all_facs) > filter_['count'] + 50:
            facs = all_facs[filter_['count']:filter_['count'] + 50]
        else:
            facs = all_facs[filter_['count']:]

    dicts = []
    for fac in facs:
        dict_ = fac.__dict__.copy()
        dict_.pop('_sa_instance_state', None)
        dicts += [dict_]
    
    Session.remove()
    return jsonify(success=True, data=dicts)

@app.route('/api/facility-shaking/<facility_id>/<eq_id>')
@login_required
def get_shaking_data(facility_id, eq_id):
    session = Session()
    shaking = (session.query(FacilityShaking)
                    .filter(FacilityShaking
                                .shakemap
                                .has(ShakeMap.shakemap_id == eq_id))
                    .first())

    shaking_dict = None
    if shaking:
        shaking_dict = shaking.__dict__.copy()
        shaking_dict.pop('_sa_instance_state', None)
    
    Session.remove()
    return jsonify(success=True, data=shaking_dict)

@app.route('/api/delete/inventory', methods=['DELETE'])
@login_required
def delete_inventory():
    inventory = json.loads(request.args.get('inventory', '[]'))
    inv_ids = [inv['shakecast_id'] for inv in inventory if inv['shakecast_id']]
    inv_type = request.args.get('inventory_type', None)
    if len(inv_ids) > 0 and inv_type is not None:
        ui.send("{'delete_inventory: %s': {'func': f.delete_inventory_by_id, \
                        'args_in': {'ids': %s, 'inventory_type': '%s'}, \
                        'db_use': True, \
                        'loop': False}}" % (inv_type, inv_ids, inv_type))

    return jsonify(success=True)

@app.route('/api/groups')
@login_required
def get_groups():
    session = Session()
    filter_ = json.loads(request.args.get('filter', '{}'))
    query = session.query(Group)
    if filter_:
        if filter_.get('user', None):
            query = query.filter(Group.users.any(User.username == filter_['user']))

    groups = query.all()
    
    group_dicts = []
    for group in groups:
        group_dict = group.__dict__.copy()
        group_dict.pop('_sa_instance_state', None)
        group_dict['info'] = json.loads(get_group_info(group.shakecast_id))
        group_dicts += [group_dict]
        
    group_json = json.dumps(group_dicts, cls=AlchemyEncoder)
    
    Session.remove()    
    return group_json

@app.route('/api/users', methods=['GET', 'POST'])
@login_required
def get_users():
    if request.method == 'GET':
        session = Session()
        filter_ = literal_eval(request.args.get('filter', 'None'))
        if filter_:
            if filter_.get('group', None):
                users = (session.query(User)
                                .filter(User.shakecast_id > request.args.get('last_id', 0))
                                .filter(User.groups.any(Group.name.like(filter_['group'])))
                                .limit(50)
                                .all())
                
            else:
                users = (session.query(User)
                                .filter(User.shakecast_id > request.args.get('last_id', 0))
                                .limit(50)
                                .all())
        else:
            users = session.query(User).filter(User.shakecast_id > request.args.get('last_id', 0)).limit(50).all()
        
        user_dicts = []
        for user in users:
            user_dict = user.__dict__.copy()
            user_dict.pop('_sa_instance_state', None)
            user_dict.pop('password', None)
            user_dicts += [user_dict]
            
        user_json = json.dumps(user_dicts, cls=AlchemyEncoder)
        
        Session.remove()  
        
    else:
        users = request.json.get('users', 'null')
        for user in users:
            if user['password'] == '':
                user.pop('password')

        if users is not None:
            ui.send("{'import_user_dicts': {'func': f.import_user_dicts, \
                                           'args_in': {'users': %s, '_user': %s}, \
                                           'db_use': True, 'loop': False}}" % (str(users), 
                                                                                current_user.shakecast_id))
        user_json = json.dumps(users)

    return user_json

@app.route('/api/users/current', methods=['GET', 'POST'])
@login_required
def get_current_user():
    user = current_user
    user_dict = user.__dict__.copy()
    user_dict.pop('_sa_instance_state', None)
    user_dict['password'] = ''
        
    user_json = json.dumps(user_dict, cls=AlchemyEncoder)
    Session.remove()  

    return user_json

@app.route('/api/shakemaps')
@login_required
def get_shakemaps():
    session = Session()
    sms = (session.query(ShakeMap)
                .order_by(ShakeMap.recieve_timestamp.desc())
                .all())
    
    sm_dicts = []
    for sm in sms:
        sm_dict = sm.__dict__.copy()
        sm_dict.pop('_sa_instance_state', None)
        sm_dicts += [sm_dict]
    
    sm_json = json.dumps(sm_dicts, cls=AlchemyEncoder)
    
    Session.remove()    
    return sm_json

@app.route('/api/shakemaps/<shakemap_id>')
@login_required
def get_shakemap(shakemap_id):
    session = Session()
    sms = (session.query(ShakeMap)
                .filter(ShakeMap.shakemap_id == shakemap_id)
                .order_by(ShakeMap.shakemap_version.desc())
                .all())
    
    sm_dicts = []
    for sm in sms:
        sm_dict = sm.__dict__.copy()
        sm_dict.pop('_sa_instance_state', None)
        sm_dicts += [sm_dict]
    
    sm_json = json.dumps(sm_dicts, cls=AlchemyEncoder)
    
    Session.remove()    
    return sm_json

@app.route('/api/shakemaps/<shakemap_id>/facilities')
@login_required
def get_affected_facilities(shakemap_id):
    session = Session()
    sms = (session.query(ShakeMap)
                .filter(ShakeMap.shakemap_id == shakemap_id)
                .order_by(ShakeMap.shakemap_version.desc())
                .all())
    
    fac_dicts = []
    alert = {'gray': 0,
             'green': 0,
             'yellow': 0,
             'orange': 0,
             'red': 0}
    if sms:
        sm = sms[0]
        fac_shaking = sm.facility_shaking
        
        fac_dicts = [0] * len(sm.facility_shaking)
        i = 0
        for s in fac_shaking:
            fac_dict = s.facility.__dict__.copy()
            s_dict = s.__dict__.copy()
            fac_dict.pop('_sa_instance_state', None)
            s_dict.pop('_sa_instance_state', None)
            fac_dict['shaking'] = s_dict
            fac_dicts[i] = fac_dict
            i += 1

            # record number of facs at each alert level
            alert[fac_dict['shaking']['alert_level']] += 1
    
    shaking_data = {'alert': alert, 'facilities': fac_dicts, 'types': {}}

    shaking_json = json.dumps(shaking_data, cls=AlchemyEncoder)
    
    Session.remove()    
    return shaking_json

@app.route('/api/shakemaps/<shakemap_id>/overlay')
@login_required
def shakemap_overlay(shakemap_id):
    session = Session()
    shakemap = (session.query(ShakeMap)
                    .filter(ShakeMap.shakemap_id == shakemap_id)
                    .order_by(desc(ShakeMap.shakemap_version))
                    .limit(1)).first()
    if shakemap is not None:
        img = os.path.join(app.config['EARTHQUAKES'],
                           shakemap_id,
                           shakemap_id + '-' + str(shakemap.shakemap_version),
                           'ii_overlay.png')
        
    else:
        img = app.send_static_file('sc_logo.png')
        
    Session.remove()
    return send_file(img, mimetype='image/gif')

@app.route('/api/shakemaps/<shakemap_id>/shakemap')
@login_required
def shakemap_map(shakemap_id):
    session = Session()
    shakemap = (session.query(ShakeMap)
                    .filter(ShakeMap.shakemap_id == shakemap_id)
                    .order_by(desc(ShakeMap.shakemap_version))
                    .limit(1)).first()
    if shakemap is not None:
        img = shakemap.get_map()

    return send_file(io.BytesIO(img), mimetype='image/png')

@app.route('/api/events/<event_id>/image')
@login_required
def event_image(event_id):
    session = Session()
    event = (session.query(Event)
                    .filter(Event.event_id == event_id)
                    .limit(1)).first()
    if event is not None:
        img = os.path.join(app.config['EARTHQUAKES'],
                           event_id,
                           'image.png')
        
    else:
        img = app.send_static_file('sc_logo.png')
        
    Session.remove()
    return send_file(img, mimetype='image/gif')

@app.route('/api/notifications/<event_id>/')
@login_required
def get_notification(event_id):
    session = Session()
    event = session.query(Event).filter(Event.event_id == event_id).first()

    dicts = []
    if event is not None:
        nots = event.notifications
        for sm in event.shakemaps:
            nots += sm.notifications

        for obj in nots:
            dict_ = obj.__dict__.copy()
            dict_.pop('_sa_instance_state', None)
            dict_['group_name'] = obj.group.name
            dicts += [dict_]
    
    json_ = json.dumps(dicts, cls=AlchemyEncoder)
    Session.remove()    
    return json_

@app.route('/api/images/')
@login_required
def get_image_list():
    dir_list = os.listdir(STATIC_DIR)
    json_ = json.dumps(dir_list)
    return json_

@app.route('/admin/api/configs', methods=['GET','POST'])
@login_required
def get_settings():
    sc = SC()
    if request.method == 'POST':
        configs = request.json.get('configs', '')
        if configs:
            json_str = json.dumps(configs, indent=4)
            if sc.validate(json_str) is True:
                sc.save(json_str)
    return sc.json

############################ Admin Pages ##############################

# wrapper for admin only URLs
def admin_only(func):
    @wraps(func)
    def func_wrapper(*args, **kwargs):
        if current_user and current_user.is_authenticated:
            if current_user.user_type.lower() == 'admin':
                return func(*args, **kwargs)
            else:
                flash('Only administrators can access this page')
                return redirect(url_for('index'))
        else:
            flash('Login as an administrator to access this page')
            return redirect(url_for('login'))
    return func_wrapper

@app.route('/api/notification-html/<notification_type>/<name>', methods=['GET','POST'])
@admin_only
@login_required
def notification_html(notification_type, name):
    config = json.loads(request.args.get('config', 'null'))
    
    session = Session()
    not_builder = NotificationBuilder()

    if notification_type == 'new_event':
        # get the two most recent events
        events = session.query(Event).all()
        events = events[-2:]
        html = not_builder.build_new_event_html(events=events, name=name, web=True, config=config)
    else:
        # get the most recent shakemap
        sms = session.query(ShakeMap).all()
        sm = sms[-1]
        html = not_builder.build_insp_html(sm, name=name, web=True, config=config)
    Session.remove()
    return html

@app.route('/api/notification-config/<notification_type>/<name>', methods=['GET','POST'])
@admin_only
@login_required
def notification_config(notification_type, name):
    temp_manager = TemplateManager()
    if request.method == 'GET':
        config = temp_manager.get_configs(notification_type, name)

    elif request.method == 'POST':
        config = request.json.get('config', None)
        if config:
            temp_manager.save_configs(notification_type, name, config)
    
    return json.dumps(config)

@app.route('/api/template-names', methods=['GET','POST'])
@admin_only
@login_required
def template_names():
    temp_manager = TemplateManager()
    return json.dumps(temp_manager.get_template_names())

@app.route('/api/scenario-download/<event_id>', methods=['GET'])
@admin_only
@login_required
def scenario_download(event_id):
    scenario = json.loads(request.args.get('scenario', 'false'))
    if event_id:
        ui.send("{'scenario_download: %s': {'func': f.download_scenario, 'args_in': {'shakemap_id': r'%s', 'scenario': %s}, 'db_use': True, 'loop': False}}" % (event_id, event_id, scenario))
    
    return json.dumps({'success': True})

@app.route('/api/scenario-delete/<event_id>', methods=['DELETE'])
@admin_only
@login_required
def scenario_delete(event_id):
    if event_id:
        ui.send("{'scenario_delete: %s': {'func': f.delete_scenario, 'args_in': {'shakemap_id': r'%s'}, 'db_use': True, 'loop': False}}" % (event_id, event_id))
    
    return json.dumps({'success': True})

@app.route('/api/scenario-run/<event_id>', methods=['POST'])
@admin_only
@login_required
def scenario_run(event_id):
    if event_id:
        ui.send("{'scenario_run: %s': {'func': f.run_scenario, 'args_in': {'shakemap_id': r'%s'}, 'db_use': True, 'loop': False}}" % (event_id, event_id))
    
    return json.dumps({'success': True})

@app.route('/api/software-update', methods=['GET','POST'])
@admin_only
@login_required
def software_update():
    s = SoftwareUpdater()
    if request.method == 'POST':
        s.update()
        ui.send("{'Restart': {'func': self.restart, 'args_in': {}, 'db_use': True, 'loop': False}}")

    update_required, notify, update_info = s.check_update()
    return json.dumps({'required': update_required,
                        'update_info': [info for info in update_info],
                        'notify': notify})

@app.route('/admin/upload/', methods=['GET','POST'])
@admin_only
@login_required
def upload():
    if request.method == 'GET':
        return render_template('admin/upload.html')

    file_type = get_file_type(request.files['file'].filename)
    if file_type is 'xml':
        file_name = str(int(time.time())) + request.files['file'].filename
        xml_files.save(request.files['file'], name=file_name)
        xml_file = os.path.join(app.config['UPLOADED_XMLFILES_DEST'],
                                file_name)
        # validate XML and determine which import function should be used
        xml_file_type = determine_xml(xml_file)
        
        # these import functions need to be submitted to the server instead
        # of run directly
        import_data = {}
        func_name = ''

        func_name = 'import_' + xml_file_type + '_xml'
        if xml_file_type is not None:
            ui.send("{'%s': {'func': f.%s, 'args_in': {'xml_file': r'%s', '_user': %s}, 'db_use': True, 'loop': False}}" % (func_name, 
                                                                                                                func_name, 
                                                                                                                xml_file,
                                                                                                                current_user.shakecast_id))
        
    elif file_type == 'image':
        image_files.save(request.files['file'])

    return 'file uploaded'

@app.route('/admin/api/groups/<group_id>/info')
@admin_only
@login_required
def get_group_info(group_id):
    session = Session()
    group = (session.query(Group)
                .filter(Group.shakecast_id == group_id)
                .first())

    if group is not None:
        group_specs = {'inspection': group.get_alert_levels(),
                        'new_event': group.get_min_mag(),
                        'heartbeat': group.has_spec('heartbeat'),
                        'scenario': group.get_scenario_alert_levels(),
                        'facilities': get_facility_info(group_name=group.name),
                        'users': group.users,
                        'template': group.template}
    
    specs_json = json.dumps(group_specs, cls=AlchemyEncoder)
    
    Session.remove()    
    return specs_json

@app.route('/admin/get/users/<user_id>/groups')
@admin_only
@login_required
def get_user_groups(user_id):
    session = Session()
    user = session.query(User).filter(User.shakecast_id == user_id).first()
    
    groups = []
    if user is not None and user.groups:
        for group in user.groups:
            group_dict = group.__dict__.copy()
            group_dict.pop('_sa_instance_state', None)
            groups += [group_dict]
    
    groups_json = json.dumps(groups, cls=AlchemyEncoder)
    
    Session.remove()    
    return groups_json

@app.route('/admin/new-template/<name>')
@admin_only
@login_required
def new_not_template(name):
    tm = TemplateManager()
    tm.create_new(name)

    return json.dumps(True)

@app.route('/admin/get/inventory')
@admin_only
@login_required
def get_inventory():
    session = Session()
    filter_ = json.loads(request.args.get('filter', '{}'))
    if filter_:
        if filter_.get('group', None) is not None:
            facilities = (session.query(Facility)
                            .filter(Facility.shakecast_id > request.args.get('last_id', 0))
                            .filter(Facility.lat_min > (float(filter_['lat']) - float(filter_['lat_pm'])))
                            .filter(Facility.lat_max < (float(filter_['lat']) + float(filter_['lat_pm'])))
                            .filter(Facility.lon_min > (float(filter_['lon']) - float(filter_['lon_pm'])))
                            .filter(Facility.lon_max < (float(filter_['lon']) + float(filter_['lon_pm'])))
                            .filter(Facility.groups.any(Group.name.like(filter_['group'])))
                            .limit(50)
                            .all())
            
        else:
            facilities = (session.query(Facility)
                            .filter(Facility.shakecast_id > request.args.get('last_id', 0))
                            .filter(Facility.lat_min > (float(filter_['lat']) - float(filter_['lat_pm'])))
                            .filter(Facility.lat_max < (float(filter_['lat']) + float(filter_['lat_pm'])))
                            .filter(Facility.lon_min > (float(filter_['lon']) - float(filter_['lon_pm'])))
                            .filter(Facility.lon_max < (float(filter_['lon']) - float(filter_['lon_pm'])))
                            .limit(50)
                            .all())
    else:   
        facilities = session.query(Facility).filter(Facility.shakecast_id > request.args.get('last_id', 0)).limit(50).all()
    
    facility_dicts = []
    for facility in facilities:
        facility_dict = facility.__dict__.copy()
        facility_dict.pop('_sa_instance_state', None)
        facility_dicts += [facility_dict]
    
    facilities_json = json.dumps(facility_dicts, cls=AlchemyEncoder)
    
    Session.remove()    
    return facilities_json

@app.route('/admin/system-test')
@admin_only
@login_required
def system_test():
    ui.send("{'System Test': {'func': f.system_test, 'args_in': {}, 'db_use': True, 'loop': False}}")

    return json.dumps(True)

def shutdown_server():
    func = request.environ.get('werkzeug.server.shutdown')
    if func is None:
        raise RuntimeError('Not running with the Werkzeug Server')
    func()

@app.route('/shutdown')
def shutdown():
    shutdown_server()
    return 'Server shutting down...'

@app.route('/admin/restart')
def restart():
    result = ui.send("{'Restart': {'func': self.restart, 'args_in': {}, 'db_use': True, 'loop': False}}")
    return json.dumps(result)

@app.route('/api/map-key')
@login_required
def map_key():
    sc = SC()
    return json.dumps(sc.map_key)

@app.errorhandler(404)
def page_not_found(error):
    return render_template('index.html')


############################# Upload Setup ############################
app.config['UPLOADED_XMLFILES_DEST'] = os.path.join(sc_dir(), 'tmp')
app.config['UPLOADED_IMAGEFILES_DEST'] = os.path.join(sc_dir(), STATIC_DIR)
app.config['EARTHQUAKES'] = os.path.join(sc_dir(), 'data')
app.config['MESSAGES'] = {}
xml_files = UploadSet('xmlfiles', ('xml',))
image_files = UploadSet('imagefiles', IMAGES, default_dest=app.config['UPLOADED_IMAGEFILES_DEST'])
configure_uploads(app, (xml_files,image_files))
ui = UI()

def get_file_type(file_name):
    ext = file_name.split('.')[-1]
    if ext in ['jpg', 'jpeg', 'png', 'bmp']:
        return 'image'
    elif ext in ['xml']:
        return 'xml'

def start():
    sc = SC()
    
    # don't start the web server if we're letting an extension do it
    if 'web_server' not in sc.dict['extensions']:
        app.run(host='0.0.0.0', port=sc.dict['web_port'], threaded=True)

if __name__ == '__main__':
    if len(sys.argv) > 1:
        if sys.argv[1] == '-d':
            # run in debug mode
            app.run(host='0.0.0.0', port=5000, debug=True, threaded=True)
    else:
        start()
