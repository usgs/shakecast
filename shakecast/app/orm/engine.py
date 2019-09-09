import time
import os

from sqlalchemy import create_engine as sqla_create_engine

from .migrations import migrate
from .util import check_testing
from ..util import SC, get_db_dir

def create_engine():
    # SETUP DATABASE
    sc = SC()
    # name the database, but switch to a test database if run from test.py
    db_name = sc.dict['DBConnection']['database'] + '.db'
    db_type = sc.dict['DBConnection']['type']
    
    if check_testing() is True:
        db_type = 'sqlite'
        db_name = 'testing.db'

    if db_type == 'sqlite':
        engine = sqla_create_engine('sqlite:///%s' % os.path.join(get_db_dir(), db_name))
    elif db_type == 'mysql':
        try:
            db_str = 'mysql://{}:{}@{}/{}'.format(sc.dict['DBConnection']['username'],
                                                            sc.dict['DBConnection']['password'],
                                                            sc.dict['DBConnection']['server'],
                                                            sc.dict['DBConnection']['database'])
            
        except Exception:
            # db doesn't exist yet, let's create it
            server_str = 'mysql://{}:{}@{}'.format(sc.dict['DBConnection']['username'],
                                                        sc.dict['DBConnection']['password'],
                                                        sc.dict['DBConnection']['server'])
            engine = sqla_create_engine(server_str)
            engine.execute('CREATE DATABASE {}'.format(sc.dict['DBConnection']['database']))

        finally:
            # try to get that connection going again
            engine = sqla_create_engine(db_str, pool_recycle=3600)
            engine.execute('USE {}'.format(sc.dict['DBConnection']['database']))
    
    return engine

engine = create_engine()
engine = migrate(engine)
