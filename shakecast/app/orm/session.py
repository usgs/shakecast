import time

from sqlalchemy.orm import scoped_session, sessionmaker

from .engine import engine
from .objects import metadata, User
from .util import check_testing

def create_session(engine):
    session_maker = sessionmaker(bind=engine)
    Session = scoped_session(session_maker)

    # if we're testing, we want to drop all existing database info to test
    # from scratch
    if check_testing() is True:
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

    return Session

Session = create_session(engine)
