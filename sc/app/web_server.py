from flask import Flask
from dbi.db_alchemy import *
from server import Server
from genericDaemon import Daemon

app = Flask(__name__)

@app.route('/')
def index():
    return 'Hello world'

@app.route('/dbtest')
def db_test():
    session = Session()
    
    eqs = session.query(ShakeMap).all()
    eqs = eqs[-10:]
    
    return_str = 'Recent EQs:\n'
    return_str += str([str(eq) for eq in eqs])

    return return_str
if __name__ == '__main__':
    sc_server = Server()
    sc_server.stop_loop = False
    #d = Daemon('sc_server')
    #d.start(sc_server.loop)
    sc_server.loop()
    app.run(debug=True, host='0.0.0.0')