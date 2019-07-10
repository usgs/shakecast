from orm import *

def db_migration(engine):
    '''
    Check for required database migrations
    '''
    from db_migrations import migrations
    from ..util import SC
    sc = SC()
    for migration in migrations:
        mig_version = int(migration.__name__.split('to')[1])
        cur_version = sc.dict['Server']['update']['db_version']
        if mig_version > cur_version:
            # run the migration
            engine = migration(engine)
            # update the configs
            sc.dict['Server']['update']['db_version'] = mig_version

    session_maker = sessionmaker(bind=engine)
    Session = scoped_session(session_maker)

    sc.save_dict()
    return engine, Session

def db_init():
    # SETUP DATABASE
    sc = SC()
    # name the database, but switch to a test database if run from test.py
    db_name = sc.dict['DBConnection']['database'] + '.db'
    testing = False
    insp = inspect_mod.stack()
    if 'tests' in str(insp):
        db_name = 'test.db'
        testing = True

    if sc.dict['DBConnection']['type'] == 'sqlite' or testing is True:
        engine = create_engine('sqlite:///%s' % os.path.join(get_db_dir(), db_name))
    elif sc.dict['DBConnection']['type'] == 'mysql':
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
            engine = create_engine(server_str)
            engine.execute('CREATE DATABASE {}'.format(sc.dict['DBConnection']['database']))

        finally:
            # try to get that connection going again
            engine = create_engine(db_str, pool_recycle=3600)
            engine.execute('USE {}'.format(sc.dict['DBConnection']['database']))

    # if we're testing, we want to drop all existing database info to test
    # from scratch
    if testing is True:
        metadata.drop_all(engine)

    # create database schema that doesn't exist
    try:
        metadata.create_all(engine, checkfirst=True)
    except Exception:
        # another service  might be initializing the db,
        # wait a sec for it to be done occurs during
        # docker init
        time.sleep(5)
        metadata.create_all(engine, checkfirst=True)

    engine, Session = db_migration(engine)

    # create scadmin if there are no other users
    session = Session()
    us = session.query(User).filter(User.user_type.like('admin')).all()
    if not us:
        u = User()
        u.username = 'scadmin'
        u.password = generate_password_hash('scadmin', method='pbkdf2:sha512')
        u.user_type = 'ADMIN'
        u.updated = time.time()
        u.updated_by = 'shakecast'
        session.add(u)
        session.commit()
    Session.remove()

    return engine, Session

IMPACT_RANKS = [
    {'name': 'gray', 'rank': 1},
    {'name': 'green', 'rank': 2},
    {'name': 'yellow', 'rank': 3},
    {'name': 'orange', 'rank': 4},
    {'name': 'red', 'rank': 5}
]

engine, Session = db_init()