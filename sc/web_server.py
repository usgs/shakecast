from app.functions_util import *
from app.objects import AlchemyEncoder
import os
import sys
import json
modules_dir = sc_dir() + 'modules'
if modules_dir not in sys.path:
    sys.path += [modules_dir]

from flask import Flask, render_template, url_for, request
import time
import datetime
from app.dbi.db_alchemy import *
from app.server import Server
from app.functions_util import *
from app.objects import Clock
app = Flask(__name__,
            template_folder=sc_dir()+'view'+get_delim()+'html',
            static_folder=sc_dir()+'view'+get_delim()+'static')

admin = Admin(app)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/earthquakes')
def earthquakes():
    # get eq info
    session = Session()
    clock = Clock()
    eqs = session.query(Event).order_by(Event.time.desc())
    datetimes = []
    Session.remove()
    for eq in eqs:
        datetimes += [clock.from_time(eq.time).strftime('%Y-%m-%d %H:%M:%S')]
    return render_template('earthquakes.html', eqs_times=zip(eqs,datetimes))

@app.route('/home')
def home():
    return render_template('home.html')

@app.route('/get/eqdata/')
def eq_data():
    session = Session()
    eqs = session.query(Event).order_by(Event.time.desc()).all()
    eq_json = json.dumps(eqs, cls=AlchemyEncoder)
    
    Session.remove()    
    return eq_json

if __name__ == '__main__':
    if len(sys.argv) > 1:
        if sys.argv[1] == '-d':
            # run in debug mode
            app.run(host='0.0.0.0', port=5000, debug=True)
    else:
        app.run(host='0.0.0.0', port=80)