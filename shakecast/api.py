from ast import literal_eval
from csv import reader
import datetime
from functools import wraps
import io
import json
import os
import sys
import time

from flask import (
    Flask,
    render_template,
    url_for,
    request,
    session,
    flash,
    redirect,
    send_file,
    send_from_directory,
    Response,
    jsonify
)
from flask_login import (
    LoginManager,
    login_user,
    logout_user,
    current_user,
    login_required
)
from flask_uploads import UploadSet, configure_uploads, IMAGES
from sqlalchemy import literal, func, desc
from werkzeug.security import generate_password_hash, check_password_hash

from .app.env import WEB_PORT
from .app.impact import get_event_impact
from .app.inventory import determine_xml, get_facility_info
from .app.jsonencoders import AlchemyEncoder, GeoJsonFeatureCollection
from .app.notifications.builder import NotificationBuilder
from .app.notifications.templates import TemplateManager
from .app.orm import *
from .app.util import SC, Clock, get_tmp_dir, get_version
from .ui import UI

BASE_DIR = os.path.join(sc_dir(),'view')
STATIC_DIR = os.path.join(sc_dir(),'view','assets')
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
    file_name = os.path.join(BASE_DIR, filename)
    return send_from_directory(BASE_DIR, filename)

@login_manager.user_loader
@dbconnect
def load_user(user_id, session=None):
    user = session.query(User).filter(User.shakecast_id==int(user_id)).first()

    # Expunge here might help with Windows threading
    #session.expunge(user)
    return user

@app.route('/api/login', methods=['POST'])
@dbconnect
def login(session=None):
    username = request.json.get('username', '')
    password = request.json.get('password', '')
    
    registered_user = (session.query(User)
                            .filter(User.username==username).first())

    if (registered_user is None or not
            check_password_hash(registered_user.password, password)):
        return jsonify(success=False)

    login_user(registered_user)
    flash('Logged in successfully')

    user = current_user.__dict__.copy()
    user.pop('_sa_instance_state', None)
    return jsonify(user)

@app.route('/api/current-user')
def logged_in():
    if current_user and current_user.is_authenticated:
        user = current_user.__dict__.copy()
        user.pop('_sa_instance_state', None)
        return jsonify(user)
    
    return None

@app.route('/api/logout')
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
    fname = os.path.join(get_tmp_dir(), 'server-messages.json')
    
    # ignore if file doesn't exist
    if os.path.isfile(fname):
        with open(fname) as file_:
            messages = file_.read()
    else:
        messages = '{}'

    return messages

@app.route('/api/events')
@login_required
@dbconnect
def get_eq_data(session=None):
    args = parse_args(request.args)

    DAY = 24*60*60
    query = session.query(Event)

    if len(list(args.keys())) != 0:
        if args.get('group'):
            query = query.filter(Event.groups.any(Group.name.like(args['group'])))
        if args.get('latMax'):
            query = query.filter(Event.lat < float(args['latMax']))
        if args.get('latMin'):
            query = query.filter(Event.lat > float(args['latMin']))
        if args.get('lonMax'):
            query = query.filter(Event.lon < float(args['lonMax']))
        if args.get('lonMin'):
            query = query.filter(Event.lon > float(args['lonMin']))

        if args.get('timeframe'):
            timeframe = args.get('timeframe')
            if timeframe == 'day':
                query = query.filter(Event.time > time.time() - DAY)
            elif timeframe == 'week':
                query = query.filter(Event.time > time.time() - 7*DAY)    
            elif timeframe == 'month':
                query = query.filter(Event.time > time.time() - 31*DAY)    
            elif timeframe == 'year':
                query = query.filter(Event.time > time.time() - 365*DAY)

        if args.get('scenario') is True:
            query = query.filter(Event.type == 'scenario')
        else:
            query = query.filter(Event.type != 'scenario')
        
        if args.get('shakemap', False) is True:
            query = query.filter(Event.shakemaps)

        if args.get('facility'):
            query = (query.filter(
                      Event.shakemaps.any(
                        ShakeMap.facility_shaking
                          .any(FacilityShaking
                                  .facility_id == args.get('facility')))))

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
    
    eq_geojson = GeoJsonFeatureCollection()
    for eq in eqs:
        eq_geojson.add_feature(eq.geojson)

    return jsonify(eq_geojson)

@app.route('/api/events/<event_id>')
@login_required
@dbconnect
def event_by_id(event_id, session=None):
    event = (session.query(Event)
                    .filter(Event.shakecast_id == event_id)
                    .first())

    if event is None:
        event = (session.query(Event)
                        .filter(Event.event_id == event_id)
                        .first())
        if event is None:
            return jsonify(False)

    eq_geojson = GeoJsonFeatureCollection()
    eq_geojson.add_feature(event.geojson)

    return jsonify(eq_geojson)

@app.route('/api/events/<event_id>/image')
@login_required
@dbconnect
def event_image(event_id, session=None):
    event = (session.query(Event)
                    .filter(Event.shakecast_id == event_id)
                    .limit(1)).first()
    if event is not None:
        img = os.path.join(app.config['EARTHQUAKES'],
                           event.event_id,
                           'image.png')
        
    else:
        img = app.send_static_file('sc_logo.png')

    return send_file(img, mimetype='image/gif')

@app.route('/api/facilities', methods=['GET', 'POST'])
@login_required
@dbconnect
def get_fac_data(session=None):
    args = request.args
    query = session.query(Facility)
    types_query = session.query(Facility.facility_type)

    keys = []
    if args.get('keywords') is not None:
        keywords = [args['keywords']]
        for line in reader(keywords, delimiter=' '):
            keys_raw = line

        keys = [key.strip(' ') for key in keys_raw]

    commands = {}
    non_command = []
    for key in keys:
        if ':' in key:
            command, value = key.split(':', 1)
            commands[command] = value
        else:
            non_command.append(key)

    if args:
        if commands.get('group', None) is not None:
            query = query.filter(Facility.groups.any(Group.name.like(commands['group'])))
            types_query = types_query.filter(Facility.groups.any(Group.name.like(commands['group'])))
        if commands.get('latMax', None) is not None:
            query = query.filter(Facility.lat_min < float(commands['latMax']))
            types_query = types_query.filter(Facility.lat_min < float(commands['latMax']))
        if commands.get('latMin', None) is not None:
            query = query.filter(Facility.lat_max > float(commands['latMin']))
            types_query = types_query.filter(Facility.lat_max > float(commands['latMin']))
        if commands.get('lonMax', None) is not None:
            query = query.filter(Facility.lon_min < float(commands['lonMax']))
            types_query = types_query.filter(Facility.lon_min < float(commands['lonMax']))
        if commands.get('lonMin', None) is not None:
            query = query.filter(Facility.lon_max > float(commands['lonMin']))
            types_query = types_query.filter(Facility.lon_max > float(commands['lonMin']))
        if commands.get('facilityType', None) is not None:
            query = query.filter(Facility.facility_type.like(commands['facilityType']))
            types_query = types_query.filter(Facility.facility_type.like(commands['facilityType']))
        if non_command:
            key_filter = [or_(literal(key).contains(func.lower(Facility.name)),
                                            func.lower(Facility.name).contains(key),
                                            func.lower(Facility.description).contains(key)) for key in non_command]
            query = query.filter(and_(*key_filter))
            types_query = types_query.filter(and_(*key_filter))
    
    # get facility types
    fac_count = []
    fac_types = types_query.distinct().all()
    for fac_type in fac_types:
        fac_count += [{ 
            'name': fac_type[0],
            'count': (types_query
                        .filter(Facility.facility_type == fac_type[0])
                        .count())
        }]

    count = args.get('limit', None)
    if count is not None:
        facs = query.limit(count).all()
    else:
        facs = query.all()

    fac_geojson = GeoJsonFeatureCollection()
    for fac in facs:
        fac_geojson.add_feature(fac.geojson)

    return jsonify(fac_geojson)

@app.route('/api/facilities/<facility_id>')
@login_required
@dbconnect
def get_fac_data_by_id(facility_id, session=None):
    facility = session.query(Facility).filter(Facility.shakecast_id == facility_id).first()
    return jsonify(facility.geojson)

@app.route('/api/facilities', methods=['DELETE'])
@login_required
def delete_faclities():
    inventory = json.loads(request.args.get('inventory', None))

    if inventory is None:
      return jsonify(success=True)

    inv_ids = [inv['properties']['shakecast_id'] for inv in inventory]
    inv_type = 'facility'
    if len(inv_ids) > 0 and inv_type is not None:
        ui.send("{'delete_inventory: %s': {'func': f.delete_inventory_by_id, \
                        'args_in': {'ids': %s, 'inventory_type': '%s'}, \
                        'db_use': True, \
                        'loop': False}}" % (inv_type, inv_ids, inv_type))

    return jsonify(success=True)

@app.route('/api/facility-shaking')
@login_required
@dbconnect
def get_shaking_data(session=None):
    shakemap_id = request.args.get('shakemap_id')
    limit = request.args.get('limit')

    query = session.query(FacilityShaking)
    if shakemap_id:
        query = (query.filter(FacilityShaking
                                .shakemap_id == shakemap_id))
    
    if limit:
        query = query.limit(limit)
    
    shaking = query.all()

    shaking_json = GeoJsonFeatureCollection()
    for each in shaking:
        shaking_json.add_feature(each.geojson)
        
    return jsonify(shaking_json)

@app.route('/api/facility-shaking/<facility_id>')
@login_required
@dbconnect
def get_shaking_data_by_id(facility_id, session=None):
    shakemap_id = request.args.get('shakemap_id')

    query = (session.query(FacilityShaking)
                    .filter(FacilityShaking.shakecast_id == facility_id))

    if shakemap_id:
        query = query.filter(FacilityShaking.shakemap_id == shakemap_id)
    
    shaking = query.all()
    shaking_json = GeoJsonFeatureCollection()
    for each in shaking:
        shaking_json.add_feature(each.geojson)

    return jsonify(shaking_json)

@app.route('/api/inventory/delete', methods=['DELETE'])
@login_required
def delete_inventory():
    inventory = json.loads(request.args.get('inventory', None))

    if inventory is None:
      return jsonify(success=True)

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
@dbconnect
def get_groups(session=None):
    user = request.args.get('user')
    query = session.query(Group)
    if user:
        query = query.filter(Group.users.any(User.username == user))

    groups = query.all()

    for group in groups:
      if group:
          users = [sql_to_obj(user.__dict__.copy()) for user in group.users]
          inspection = group.get_alert_levels()
          min_mag = group.get_min_mag()
          heartbeat = group.gets_notification('heartbeat')
          scenario = group.get_scenario_alert_levels()
          facility_info = get_facility_info(group_name=group.name, session=session)
          template = group.template

          group.group_specs = {'inspection': inspection,
                          'new_event': min_mag,
                          'heartbeat': heartbeat,
                          'scenario': scenario,
                          'facilities': facility_info,
                          'users': users,
                          'template': template}

    group_json = GeoJsonFeatureCollection()
    for group in groups:
        geojson = group.geojson

        if group.group_specs:
          geojson['properties']['specs'] = group.group_specs

        group_json.add_feature(geojson)

    return jsonify(group_json)

@app.route('/api/groups', methods=['DELETE'])
@login_required
def delete_groups():
    inventory = json.loads(request.args.get('inventory', None))

    if inventory is None:
      return jsonify(success=True)

    inv_ids = [inv['properties']['shakecast_id'] for inv in inventory]
    inv_type = 'group'
    if len(inv_ids) > 0 and inv_type is not None:
        ui.send("{'delete_inventory: %s': {'func': f.delete_inventory_by_id, \
                        'args_in': {'ids': %s, 'inventory_type': '%s'}, \
                        'db_use': True, \
                        'loop': False}}" % (inv_type, inv_ids, inv_type))

    return jsonify(success=True)

@app.route('/api/groups/<group_id>/summary')
@login_required
@dbconnect
def get_group_info(group_id, session=None):

    group = (session.query(Group)
                .filter(Group.shakecast_id == group_id)
                .first())

    group_specs = None
    if group:

        users = [sql_to_obj(user.__dict__.copy()) for user in group.users]
        inspection = group.get_alert_levels()
        min_mag = group.get_min_mag()
        heartbeat = group.gets_notification('heartbeat')
        scenario = group.get_scenario_alert_levels()
        facility_info = get_facility_info(group_name=group.name, session=session)
        template = group.template

        group_specs = {'inspection': inspection,
                        'new_event': min_mag,
                        'heartbeat': heartbeat,
                        'scenario': scenario,
                        'facilities': facility_info,
                        'users': users,
                        'template': template}
    
    return jsonify(group_specs)

@app.route('/api/users', methods=['GET', 'POST'])
@login_required
@dbconnect
def get_users(session=None):
    if request.method == 'GET':
        args = parse_args(request.args)
        query = session.query(User)

        if args.get('group', None):
            query = query.filter(User.groups.any(Group.name.like(args['group'])))
            
        users = query.all()
        
    else:
        users = request.json.get('users')
        if not users:
            return jsonify(False)

        if users is not None:
            ui.send("{'import_user_dicts': {'func': f.import_user_dicts, \
                                           'args_in': {'users': %s, '_user': %s}, \
                                           'db_use': True, 'loop': False}}" % (users, 
                                                                                current_user.shakecast_id))

    return jsonify(users)

@app.route('/api/users/current', methods=['GET', 'POST'])
@login_required
def get_current_user():
    if current_user and current_user.is_authenticated:
        user = current_user
        user_dict = user.__dict__.copy()
        user_dict.pop('_sa_instance_state', None)
        user_dict['password'] = ''
        
        return jsonify(user_dict)
    else:
      return None

@app.route('/api/shakemaps')
@login_required
@dbconnect
def get_shakemaps(session=None):
    sms = (session.query(ShakeMap)
                .order_by(ShakeMap.recieve_timestamp.desc())
                .all())
    
    sm_json = GeoJsonFeatureCollection()
    for sm in sms:
        sm_json.add_feature(sm.geojson)

    return jsonify(sm_json)

@app.route('/api/shakemaps/<shakemap_id>')
@login_required
@dbconnect
def get_shakemap(shakemap_id, session=None):
    version = request.args.get('version')

    query = (session.query(ShakeMap)
                .filter(ShakeMap.shakemap_id == shakemap_id)
                .order_by(ShakeMap.shakemap_version.desc()))
    
    if version:
        query = query.filter(ShakeMap.shakemap_version == version)
    
    shakemaps = query.all()
    
    shakemap_json = GeoJsonFeatureCollection()
    for shakemap in shakemaps:
        shakemap_json.add_feature(shakemap.geojson)

    return jsonify(shakemap_json)

@app.route('/api/shakemaps/<shakemap_id>/impact-summary')
@login_required
@dbconnect
def impact_summary(shakemap_id, session=None):
    shakemap = (session.query(ShakeMap)
                .filter(ShakeMap.shakemap_id == shakemap_id)
                .first())

    impact = None
    if shakemap is not None:
        impact = get_event_impact(shakemap.facility_shaking)

    return jsonify(impact)

@app.route('/api/shakemaps/<shakemap_id>/impact')
@login_required
@dbconnect
def shakemap_impact(shakemap_id, session=None):
    shakemap = (session.query(ShakeMap)
                    .filter(ShakeMap.shakemap_id == shakemap_id)
                    .order_by(desc(ShakeMap.shakemap_version))
                    .limit(1)).first()
    
    emptyJSON = json.dumps({'type': 'FeatureCollection', 'features': []})
    
    if shakemap is None:
        # This shakemap does not exist
        # return an empty feature
        return emptyJSON

    json_file = os.path.join(shakemap.local_products_dir, 'impact.json')
    if os.path.exists(json_file) is True:
        with open(json_file, 'r') as f_:
            geoJSON = f_.read()
    else:
        geoJSON = emptyJSON

    return geoJSON

@app.route('/api/shakemaps/<shakemap_id>/overlay')
@login_required
@dbconnect
def shakemap_overlay(shakemap_id, session=None):
    shakemap = (session.query(ShakeMap)
                    .filter(ShakeMap.shakemap_id == shakemap_id)
                    .order_by(desc(ShakeMap.shakemap_version))
                    .limit(1)).first()

    img = None
    if shakemap is not None:
        img = shakemap.get_overlay()

    if shakemap is None or img is None:
        img = app.send_static_file('sc_logo.png')

    return send_file(img, mimetype='image/gif')

@app.route('/api/shakemaps/<shakemap_id>/shakemap')
@login_required
@dbconnect
def shakemap_map(shakemap_id, session=None):
    shakemap = (session.query(ShakeMap)
                    .filter(ShakeMap.shakemap_id == shakemap_id)
                    .order_by(desc(ShakeMap.shakemap_version))
                    .limit(1)).first()
    if shakemap is not None:
        img = shakemap.get_map()

    return send_file(io.BytesIO(img), mimetype='image/png')

@app.route('/api/shakemaps/<shakemap_id>/products')
@login_required
@dbconnect
def shakemap_products(shakemap_id, session=None):
    shakemap = session.query(ShakeMap).filter(ShakeMap.shakecast_id == shakemap_id).first()

    return jsonify(shakemap.products)

@app.route('/api/shakemaps/<shakemap_id>/products/<product_name>')
@login_required
@dbconnect
def shakemap_product_by_name(shakemap_id, product_name, session=None):
    shakemap = session.query(ShakeMap).filter(ShakeMap.shakecast_id == shakemap_id).first()

    product = shakemap.get_product(product_name)
    return jsonify(product)

@app.route('/api/notifications')
@login_required
@dbconnect
def get_notifications(session=None):
  event_id = request.args.get('event_id', None)
  query = session.query(Notification)

  if event_id is not None:
      query = query.filter(Notification.event.has(Event.event_id == event_id))

  notifications = query.all()

  json_notifications = [n.get_json() for n in notifications]
  return jsonify(json_notifications)

@app.route('/api/images/')
@login_required
def get_image_list():
    dir_list = os.listdir(STATIC_DIR)

    return jsonify(dir_list)

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

@app.route('/api/configs', methods=['GET','POST'])
@admin_only
@login_required
def get_settings():
    sc = SC()
    if request.method == 'POST':
        configs = request.json.get('configs', '')
        if configs:
            json_str = json.dumps(configs, indent=4)
            if sc.validate(json_str) is True:
                sc.save(json_str)
    
    configs = sc.dict
    configs['Server']['update']['software_version'] = get_version()

    return jsonify(configs)

@app.route('/api/notification-html/<notification_type>/<name>', methods=['GET','POST'])
@admin_only
@login_required
@dbconnect
def notification_html(notification_type, name, session=None):
    no_preview = '<h1>No Preview Available</h1>'
    html = None
    config = json.loads(request.args.get('config', 'null'))
    not_builder = NotificationBuilder()

    if notification_type == 'new_event':
        # get the two most recent events
        events = session.query(Event).all()

        if events:
            events = events[-2:]
            html = not_builder.build_new_event_html(events=events, name=name, web=True, config=config)
    elif notification_type != 'pdf':
        # get the most recent shakemap
        sms = session.query(ShakeMap).all()

        if sms:
            sm = sms[-1]
            html = not_builder.build_insp_html(sm, name=name, web=True, config=config)

    return html or no_preview

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

@app.route('/api/upload/', methods=['GET','POST'])
@admin_only
@login_required
def upload():
    if request.method == 'GET':
        return render_template('admin/upload.html')

    file_type = get_file_type(request.files['file'].filename)
    if file_type == 'xml':
        file_name = str(int(time.time())) + request.files['file'].filename
        xml_files.save(request.files['file'], name=file_name)
        xml_file = os.path.join(app.config['UPLOADED_XMLFILES_DEST'],
                                file_name)
        # validate XML and determine which import function should be used
        xml_file_type = determine_xml(xml_file)
        
        # these import functions need to be submitted to the server instead
        # of run directly
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

@app.route('/api/new-template/<name>')
@admin_only
@login_required
def new_not_template(name):
    tm = TemplateManager()
    tm.create_new(name)

    return json.dumps(True)

@app.route('/api/system-test')
@admin_only
@login_required
def system_test():
    ui = UI()
    result = ui.send("{'System Test': {'func': f.system_test, 'args_in': {}, 'db_use': True, 'loop': False}}")

    return json.dumps(result)

def shutdown_server():
    func = request.environ.get('werkzeug.server.shutdown')
    if func is None:
        raise RuntimeError('Not running with the Werkzeug Server')
    func()

@app.route('/shutdown')
def shutdown():
    shutdown_server()
    return 'Server shutting down...'

@app.route('/api/restart')
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
app.config['UPLOADED_XMLFILES_DEST'] = get_tmp_dir()
app.config['UPLOADED_IMAGEFILES_DEST'] = os.path.join(sc_dir(), STATIC_DIR)
app.config['EARTHQUAKES'] = get_data_dir()
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

def parse_args(args_in):
    args = {}
    for key in list(args_in.keys()):
      args[key] = json.loads(args_in[key])

    return args

def start():
    sc = SC()
    
    # don't start the web server if we're letting an extension do it
    if 'web_server' not in sc.dict['extensions']:
        print('Running on web server on port: {}'.format(WEB_PORT))
        app.run(host='0.0.0.0', port=int(WEB_PORT))

if __name__ == '__main__':
    if len(sys.argv) > 1:
        if sys.argv[1] == '-d':
            # run in debug mode
            app.run(host='0.0.0.0', port=int(WEB_PORT), debug=True)
    else:
        start()
