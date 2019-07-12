"""
Functions for interacting with the ShakeCast database
"""

from functools import wraps

from sqlalchemy.orm.session import Session as SessionClass

from objects import MetaData, Base
from .engine import engine
from .session import Session

def clear_data(session, engine):
    meta = MetaData(engine)
    for table in reversed(meta.sorted_tables):
        print 'Clear table %s' % table
        session.execute(table.delete())
    session.commit()

# decorator for DB connection
def dbconnect(func):
    @wraps(func)
    def inner(*args, **kwargs):
        remove_session = False
        session = None

        # check if session is passed as arg
        new_args = []
        for arg in args:
            if isinstance(arg, SessionClass):
                session = arg
            else:
                new_args.append(arg)

        # get session from kwargs -- will overwrite session from
        # regular arg to ensure only one gets passed to the
        # function
        if 'session' in kwargs:
            session = kwargs.pop('session')

        # if there is no session, create one
        if session is None:
            session = Session()

            # this session is created only for this function, destroy
            # it on completion
            remove_session = True

        try:
            # run the function
            return_val = func(*new_args, session=session, **kwargs)
            session.commit()
        except:
            session.rollback()
            return_val = None
            raise
        finally:
            refresh(return_val, session=session)

            # function-specific session, close it
            if remove_session is True:
                session.expunge_all()
                Session.remove()

        return return_val
    return inner

def refresh(obj, session=None):
    if isinstance(obj, Base):
        session.refresh(obj)
    elif isinstance(obj, list):
        for o in obj:
            if isinstance(o, Base):
                session.refresh(o)
    elif isinstance(obj, dict):
        pass
