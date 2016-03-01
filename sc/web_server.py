from flask import Flask, render_template, url_for
from app.dbi.db_alchemy import *
from app.server import Server
from app.functions_util import *
app = Flask(__name__,
            template_folder=sc_dir()+'view'+get_delim()+'html',
            static_folder=sc_dir()+'images')

@app.route('/')
def index():
    session = Session()
    
    eqs = session.query(ShakeMap).all()
    eq_lst = [str(eq) for eq in eqs]
    return render_template('index.html', eqs=eq_lst)

@app.route('/dbtest')
def db_test():
    session = Session()
    
    eqs = session.query(ShakeMap).all()
    eqs = eqs[-10:]
    
    return_str = 'Recent EQs:\n'
    return_str += str([str(eq) for eq in eqs])

    return return_str
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')