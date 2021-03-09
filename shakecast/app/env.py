# Pulls environment variables in order ot configure shakecast

import os
from .util import SC, sc_dir, get_user_dir, get_db_dir

sc = SC()

DB_CONNECTION_TYPE = os.environ.get('SHAKECAST_DB_CONNECTION_TYPE', sc.dict['DBConnection']['type'])
DB_CONNECTION_STRING = os.environ.get('SHAKECAST_DB_CONNECTION_STRING', f'sqlite:///{os.path.join(get_db_dir(), "shakecast.db")}')

DEBUG_LEVEL = int(os.environ.get('SHAKECAST_DEBUG_LEVEL', 0))
LOG_DIRECTORY = os.environ.get('SHAKECAST_LOG_DIRECTORY', os.path.join(sc_dir(), 'logs'))

SERVER_PORT = int(os.environ.get('SHAKECAST_SERVER_PORT', sc.dict['port']))
SERVER_HOST_NAME = os.environ.get('SHAKECAST_SERVER_HOST_NAME', 'localhost')

SHAKECAST_DIRECTORY = sc_dir()

SMTP_ENVELOPE_FROM = os.environ.get('SHAKECAST_SMTP_ENVELOPE_FROM', sc.dict['SMTP']['envelope_from'])
SMTP_FROM = os.environ.get('SHAKECAST_SMTP_FROM', sc.dict['SMTP']['from'])
SMTP_PASSWORD = os.environ.get('SHAKECAST_SMTP_PASSWORD', sc.dict['SMTP']['password'])
SMTP_PORT = int(os.environ.get('SHAKECAST_SMTP_PORT', sc.dict['SMTP']['port']))
SMTP_SECURITY = os.environ.get('SHAKECAST_SMTP_SECURITY', sc.dict['SMTP']['security'])
SMTP_SERVER = os.environ.get('SHAKECAST_SMTP_SERVER', sc.dict['SMTP']['server'])
SMTP_USERNAME = os.environ.get('SHAKECAST_SMTP_USERNAME', sc.dict['SMTP']['username'])
SMTP_SEND_NOTIFICATIONS = os.environ.get('SHAKECAST_SMTP_SEND_NOTIFICATIONS', 1) 

USER_DIRECTORY = os.environ.get('SHAKECAST_USER_DIRECTORY', get_user_dir())
WEB_PORT = int(os.environ.get('SHAKECAST_WEB_PORT', sc.dict['web_port']))
