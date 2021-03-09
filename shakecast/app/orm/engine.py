import os

from sqlalchemy import create_engine
from sqlalchemy_utils import database_exists, create_database

from .migrations import migrate

import shakecast.app.env as env

def create_db_engine():
    # Create an engine object.
    url = env.DB_CONNECTION_STRING
    engine = create_engine(url)

    # Create database if it does not exist.
    if not database_exists(engine.url):
        create_database(engine.url)
    else:
        # Connect the database if exists.
        engine.connect()
    return engine

engine = create_db_engine()
engine = migrate(engine)
