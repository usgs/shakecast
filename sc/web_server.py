from app.functions_util import *
from app.objects import AlchemyEncoder
import os
import sys
import json
modules_dir = os.path.join(sc_dir(), 'modules')
if modules_dir not in sys.path:
    sys.path += [modules_dir]

from flask import Flask, render_template, url_for, request, session, flash, redirect
from flask_login import LoginManager, login_user, logout_user, current_user, login_required
from flask_uploads import UploadSet, configure_uploads
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps
import time
import datetime
from ast import literal_eval
from app.dbi.db_alchemy import *
from app.server import Server
from app.functions_util import *
from app.objects import Clock, SC
from app.functions import determine_xml
from ui import UI
import pdb

app = Flask(__name__,
            template_folder=os.path.join(sc_dir(),'view','html'),
            static_folder=os.path.join(sc_dir(),'view','static'))

################################ Login ################################

app.secret_key = 'super secret key'
app.config['SESSION_TYPE'] = 'filesystem'
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

@login_manager.user_loader
def load_user(user_id):
    session = Session()
    user = session.query(User).filter(User.shakecast_id==int(user_id)).first()
    
    Session.remove()
    return user

@app.route('/login', methods=['GET','POST'])
def login():
    if request.method == 'GET':
        return render_template('login.html')
    session = Session()
    username = request.form['username']
    password = request.form['password']
    
    registered_user = (session.query(User)
                            .filter(and_(User.username==username)).first())
    
    if (registered_user is None or not
            check_password_hash(registered_user.password, password)):
        Session.remove()
        return redirect('/#login-fail')

    login_user(registered_user)
    flash('Logged in successfully')
    Session.remove()
    return redirect(request.args.get('next') or url_for('index'))

@app.route('/logout')
def logout():
    logout_user()
    flash('Logged out successfully')
    return redirect(url_for('login'))

############################# User Domain #############################

@app.route('/')
@login_required
def index():
    return render_template('index.html')

@app.route('/earthquakes')
@login_required
def earthquakes():
    return render_template('earthquakes.html')

@app.route('/home')
@login_required
def home():
    return render_template('home.html')

@app.route('/get/eqdata/')
def eq_data():
    session = Session()
    eqs = session.query(Event).filter(Event.event_id != 'heartbeat').order_by(Event.time.desc()).all()
    
    eq_dicts = []
    for eq in eqs:
        eq_dict = eq.__dict__.copy()
        eq_dict.pop('_sa_instance_state', None)
        eq_dicts += [eq_dict]
    
    eq_json = json.dumps(eq_dicts, cls=AlchemyEncoder)
    
    Session.remove()    
    return eq_json

############################ Admin Pages ##############################

# wrapper for admin only URLs
def admin_only(func):
    @wraps(func)
    def func_wrapper():
        if current_user and current_user.is_authenticated:
            if current_user.user_type.lower() == 'admin':
                return func()
            else:
                flash('Only administrators can access this page')
                return redirect(url_for('index'))
        else:
            flash('Login as an administrator to access this page')
            return redirect(url_for('login'))
    return func_wrapper

@app.route('/admin/')
@admin_only
@login_required
def admin():
    return render_template('admin/admin.html')

@app.route('/admin/settings/', methods=['GET','POST'])
@admin_only
@login_required
def settings():
    if request.method == 'GET':
        return render_template('admin/settings.html')
    sc = SC()
    settings = request.get_json().get('settings', '')
    sc.json = json.dumps(settings)
    
    if sc.validate() is True:
        sc.save()
        return redirect('/admin/#/settings/')

@app.route('/admin/inventory/')
@admin_only
@login_required
def inventory():
    return render_template('admin/inventory.html')

@app.route('/admin/users/')
@admin_only
@login_required
def users():
    return render_template('admin/users.html')

@app.route('/admin/groups/')
@admin_only
@login_required
def groups():
    return render_template('admin/groups.html')

@app.route('/admin/upload/', methods=['GET','POST'])
@admin_only
@login_required
def upload():
    if request.method == 'GET':
        return render_template('admin/upload.html')
    
    xml_files.save(request.files['file'])
    xml_file = os.path.join(app.config['UPLOADED_XMLFILES_DEST'],
                            request.files['file'].filename)
    # validate XML and determine which import function should be used
    xml_file_type = determine_xml(xml_file)
    
    # these import functions need to be submitted to the server instead
    # of run directly
    import_data = {}
    if xml_file_type is 'facility':
        ui.send("{'import_facility_xml': {'func': import_facility_xml, \
                                          'args_in': {'xml_file': r'%s'}, \
                                          'db_use': True, \
                                          'loop': False}}" % xml_file)

    if xml_file_type is 'group':
        send_str = ("{'import_group_xml': {'func': import_group_xml, \
                                          'args_in': {'xml_file': r'%s'}, \
                                          'db_use': True, \
                                          'loop': False}}" % xml_file)
        ui.send(send_str)
    if xml_file_type is 'user':
        ui.send("{'import_user_xml': {'func': import_user_xml, \
                                          'args_in': {'xml_file': r'%s'}, \
                                          'db_use': True, \
                                          'loop': False}}" % xml_file)
    else:
        import_data = {'error': 'root'}
        
    time.sleep(1)
    message = ui.get_message()
    if message:
        return message
    else:
        return 'no message'
        
    

@app.route('/admin/notification', methods=['GET','POST'])
@admin_only
@login_required
def notification():
    if request.method == 'GET' and len(request.args) == 0:
        return render_template('admin/notification.html')
    elif request.method == 'GET':
        return "<h1>notification {0}</h1>".format(len(request.args))
    
@app.route('/new_event', methods=['GET','POST'])
@admin_only
@login_required
def new_event():
    return render_template('admin/new_event.html')

@app.route('/inspection', methods=['GET','POST'])
@admin_only
@login_required
def inspection():
    return '<h1>inspection</h1>'
    

@app.route('/admin/earthquakes')
@admin_only
@login_required
def admin_eqs():
    return '<h1>earthquakes</h1>'

@admin_only
@login_required
@app.route('/admin/get/groups')
def get_groups():
    session = Session()
    groups = (session.query(Group)
                .filter(Group.shakecast_id > request.args.get('last_id', 0))
                .limit(50)
                .all())
    
    group_dicts = []
    for group in groups:
        group_dict = group.__dict__.copy()
        group_dict.pop('_sa_instance_state', None)
        group_dicts += [group_dict]
        
    group_json = json.dumps(group_dicts, cls=AlchemyEncoder)
    
    Session.remove()    
    return group_json

@admin_only
@login_required
@app.route('/admin/get/groups/<group_id>/specs')
def get_group_specs(group_id):
    session = Session()
    group = (session.query(Group)
                .filter(Group.shakecast_id == group_id)
                .first())
    
    group_specs = {'inspection': [],
                   'new_event': [],
                   'heartbeat': [],
                   'scenario_inspection': [],
                   'scenario_new_event': []}
    if group is not None:
        for spec in group.specs:
            if spec.notification_type is not None and spec.event_type is not None:
                spec_dict = spec.__dict__.copy()
                spec_dict.pop('_sa_instance_state', None)
                if spec.notification_type.lower() == 'damage' and spec.event_type.lower() == 'actual':
                    group_specs['inspection'] += [spec_dict]
                elif spec.notification_type.lower() == 'new_event' and spec.event_type.lower() == 'actual':
                    group_specs['new_event'] += [spec_dict]
                elif spec.notification_type.lower() == 'damage' and spec.event_type.lower() =='scenario':
                    group_specs['scenario_inspection'] += [spec_dict]
                elif spec.notification_type.lower() == 'new_event' and spec.event_type.lower() =='scenario':
                    group_specs['scenario_new_event'] += [spec_dict]
                elif spec.notification_type.lower() == 'heartbeat':
                    group_specs['heartbeat'] += [spec_dict]
    
    specs_json = json.dumps(group_specs, cls=AlchemyEncoder)
    
    Session.remove()    
    return specs_json

@admin_only
@login_required
@app.route('/admin/get/users')
def get_users():
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
        user_dicts += [user_dict]
        
    user_json = json.dumps(user_dicts, cls=AlchemyEncoder)
    
    Session.remove()    
    return user_json

@admin_only
@login_required
@app.route('/admin/get/users/<user_id>/groups')
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

@admin_only
@login_required
@app.route('/admin/get/inventory')
def get_inventory():
    session = Session()
    filter_ = literal_eval(request.args.get('filter', 'None'))
    if filter_:
        if filter_.get('group', None):
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

@admin_only
@login_required
@app.route('/admin/get/settings')
def get_settings():
    sc = SC()
    return sc.json

############################# Upload Setup ############################
app.config['UPLOADED_XMLFILES_DEST'] = os.path.join(sc_dir(), 'tmp')
xml_files = UploadSet('xmlfiles', ('xml',))
configure_uploads(app, (xml_files,))


if __name__ == '__main__':
    ui = UI()
    if len(sys.argv) > 1:
        if sys.argv[1] == '-d':
            # run in debug mode
            app.run(host='0.0.0.0', port=5000, debug=True)
    else:
        app.run(host='0.0.0.0', port=80)