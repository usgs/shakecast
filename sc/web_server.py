from flask import Flask, render_template, url_for
import time
import datetime
from app.dbi.db_alchemy import *
from app.server import Server
from app.functions_util import *
app = Flask(__name__,
            template_folder=sc_dir()+'view'+get_delim()+'html',
            static_folder=sc_dir()+'view'+get_delim()+'static')

@app.route('/')
def index():
    session = Session()
    
    eqs = session.query(Event).order_by(Event.time.desc())
    datetimes = []
    for eq in eqs:
        datetimes += [datetime.datetime.fromtimestamp(eq.time/1000.0).strftime('%Y-%m-%d %H:%M:%S')]
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
    app.run(host='0.0.0.0', port=80)