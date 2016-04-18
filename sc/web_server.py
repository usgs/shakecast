from app.functions_util import *
from app.objects import AlchemyEncoder
import os
import sys
import json
modules_dir = sc_dir() + 'modules'
if modules_dir not in sys.path:
    sys.path += [modules_dir]

from flask import Flask, render_template, url_for, request, session, flash, redirect
from flask_login import LoginManager, login_user, logout_user, current_user, login_required
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps
import time
import datetime
from app.dbi.db_alchemy import *
from app.server import Server
from app.functions_util import *
from app.objects import Clock
app = Flask(__name__,
            template_folder=sc_dir()+'view'+get_delim()+'html',
            static_folder=sc_dir()+'view'+get_delim()+'static')

app.secret_key = 'super secret key'
app.config['SESSION_TYPE'] = 'filesystem'

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

@login_manager.user_loader
def load_user(user_id):
    session = Session()
    user = session.query(User).filter(User.shakecast_id==int(user_id)).first()
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
        return redirect('/#login-fail')
    login_user(registered_user)
    flash('Logged in successfully')
    return redirect(request.args.get('next') or url_for('index'))

#@app.route('/login-fail', methods=['GET','POST'])
#def login_fail():
#    return login()

@app.route('/logout')
def logout():
    logout_user()
    flash('Logged out successfully')
    return redirect(url_for('login'))

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
    eq_json = json.dumps(eqs, cls=AlchemyEncoder)
    
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

@app.route('/admin')
@admin_only
@login_required
def admin():
    return render_template('admin.html')

@app.route('/admin/settings')
@admin_only
@login_required
def settings():
    return '<h1>settings</h1>'

@app.route('/admin/inventory')
@admin_only
@login_required
def inventory():
    return '<h1>inventory</h1>'

@app.route('/admin/users')
@admin_only
@login_required
def users():
    return '<h1>users</h1>'

@app.route('/admin/groups')
@admin_only
@login_required
def groups():
    return '<h1>groups</h1>'

@app.route('/admin/upload')
@admin_only
@login_required
def upload():
    return '<h1>upload</h1>'

@app.route('/admin/earthquakes')
@admin_only
@login_required
def admin_eqs():
    return '<h1>earthquakes</h1>'

if __name__ == '__main__':
    if len(sys.argv) > 1:
        if sys.argv[1] == '-d':
            # run in debug mode
            app.run(host='0.0.0.0', port=5000, debug=True)
    else:
        app.run(host='0.0.0.0', port=80)