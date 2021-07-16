from csv import reader
import io
import json
import os
import sys
import time

from flask import (
    Flask,
    render_template,
    request,
    flash,
    send_file,
    send_from_directory,
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

from shakecast.app.env import WEB_PORT, USER_TMP_DIR
from shakecast.app.impact import get_event_impact
from shakecast.app.inventory import get_facility_info
from shakecast.app.jsonencoders import AlchemyEncoder, GeoJsonFeatureCollection
from shakecast.app.notifications.builder import NotificationBuilder
from shakecast.app.notifications.templates import TemplateManager
from shakecast.app.orm import *
from shakecast.app.util import SC, get_version

from .adminonly import admin_only
from .blueprint import routes
from .uploadsets import image_files, xml_files
from .util import parse_args

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
@routes.route('/<path:filename>')
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

@routes.route('/api/login', methods=['POST'])
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

@routes.route('/api/current-user')
def logged_in():
    if current_user and current_user.is_authenticated:
        user = current_user.__dict__.copy()
        user.pop('_sa_instance_state', None)
        return jsonify(user)
    
    return None

@routes.route('/api/logout')
def logout():
    logout_user()
    return jsonify(success=True)

############################# User Domain #############################

@routes.route('/')
def index():
    return render_template('index.html')

@routes.route('/api/messages')
@login_required
def get_messages():
    fname = os.path.join(USER_TMP_DIR, 'server-messages.json')
    
    # ignore if file doesn't exist
    if os.path.isfile(fname):
        with open(fname) as file_:
            messages = file_.read()
    else:
        messages = '{}'

    return messages

@routes.route('/api/events')
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

@routes.route('/api/events/<event_id>')
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

@routes.route('/api/events/<event_id>/image')
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

@routes.route('/api/facilities', methods=['GET', 'POST'])
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

@routes.route('/api/facilities/<facility_id>')
@login_required
@dbconnect
def get_fac_data_by_id(facility_id, session=None):
    facility = session.query(Facility).filter(Facility.shakecast_id == facility_id).first()
    return jsonify(facility.geojson)

@routes.route('/api/facility-shaking')
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

@routes.route('/api/facility-shaking/<facility_id>')
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

@routes.route('/api/groups')
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

@routes.route('/api/groups/<group_id>/summary')
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

@routes.route('/api/users', methods=['GET'])
@login_required
@dbconnect
def get_users(session=None):
    args = parse_args(request.args)
    query = session.query(User)

    if args.get('group', None):
        query = query.filter(User.groups.any(Group.name.like(args['group'])))
        
    users = query.all()
    return jsonify(users)

@routes.route('/api/users/current', methods=['GET', 'POST'])
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

@routes.route('/api/shakemaps')
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

@routes.route('/api/shakemaps/<shakemap_id>')
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

@routes.route('/api/shakemaps/<shakemap_id>/impact-summary')
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

@routes.route('/api/shakemaps/<shakemap_id>/impact')
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

@routes.route('/api/shakemaps/<shakemap_id>/overlay')
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

@routes.route('/api/shakemaps/<shakemap_id>/shakemap')
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

@routes.route('/api/shakemaps/<shakemap_id>/products')
@login_required
@dbconnect
def shakemap_products(shakemap_id, session=None):
    shakemap = session.query(ShakeMap).filter(ShakeMap.shakecast_id == shakemap_id).first()

    return jsonify(shakemap.products)

@routes.route('/api/shakemaps/<shakemap_id>/products/<product_name>')
@login_required
@dbconnect
def shakemap_product_by_name(shakemap_id, product_name, session=None):
    shakemap = session.query(ShakeMap).filter(ShakeMap.shakecast_id == shakemap_id).first()

    product = shakemap.get_product(product_name)
    return jsonify(product)

@routes.route('/api/notifications')
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

@routes.route('/api/images/')
@login_required
def get_image_list():
    dir_list = os.listdir(STATIC_DIR)

    return jsonify(dir_list)

############################ Admin Pages ##############################

@routes.route('/api/configs', methods=['GET','POST'])
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

@routes.route('/api/notification-html/<notification_type>/<name>', methods=['GET','POST'])
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

@routes.route('/api/notification-config/<notification_type>/<name>', methods=['GET','POST'])
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

@routes.route('/api/template-names', methods=['GET','POST'])
@admin_only
@login_required
def template_names():
    temp_manager = TemplateManager()
    return json.dumps(temp_manager.get_template_names())

@routes.route('/api/new-template/<name>')
@admin_only
@login_required
def new_not_template(name):
    tm = TemplateManager()
    tm.create_new(name)

    return json.dumps(True)

def shutdown_server():
    func = request.environ.get('werkzeug.server.shutdown')
    if func is None:
        raise RuntimeError('Not running with the Werkzeug Server')
    func()

@routes.route('/shutdown')
def shutdown():
    shutdown_server()
    return 'Server shutting down...'

@routes.route('/api/map-key')
@login_required
def map_key():
    sc = SC()
    return json.dumps(sc.map_key)

@routes.errorhandler(404)
def page_not_found(error):
    return render_template('index.html')


############################# Upload Setup ############################
app.config['UPLOADED_XMLFILES_DEST'] = USER_TMP_DIR
app.config['UPLOADED_IMAGEFILES_DEST'] = os.path.join(sc_dir(), STATIC_DIR)
app.config['EARTHQUAKES'] = get_data_dir()
app.config['MESSAGES'] = {}
configure_uploads(app, (xml_files,image_files))

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
