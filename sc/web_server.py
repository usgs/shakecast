from app.functions_util import *
import os
import sys
modules_dir = sc_dir() + 'modules'
if modules_dir not in sys.path:
    sys.path += [modules_dir]

from flask import Flask, render_template, url_for
import time
import datetime
from app.dbi.db_alchemy import *
from app.server import Server
from app.functions_util import *
from app.objects import Clock
app = Flask(__name__,
            template_folder=sc_dir()+'view'+get_delim()+'html',
            static_folder=sc_dir()+'view'+get_delim()+'static')

@app.route('/')
def index():
    session = Session()
    clock = Clock()
    eqs = session.query(Event).order_by(Event.time.desc())
    
    datetimes = []
    for eq in eqs:
        datetimes += [clock.from_time(eq.time).strftime('%Y-%m-%d %H:%M:%S')]
    return render_template('index.html', eqs_times=zip(eqs,datetimes))

@app.route('/dbtest')
def db_test():
    session = Session()
    
    eqs = session.query(ShakeMap).all()
    eqs = eqs[-10:]
    
    return_str = 'Recent EQs:\n'
    return_str += str([str(eq) for eq in eqs])

    return return_str
if __name__ == '__main__':
    if len(sys.argv) > 1:
        if sys.argv[1] == '-d':
            # run in debug mode
            app.run(host='0.0.0.0', port=80, debug=True)
    else:
        app.run(host='0.0.0.0', port=80)