# Pulls environment variables in order ot configure shakecast

import os
from .util import SC, sc_dir, get_user_dir, get_db_dir, get_tmp_dir

sc = SC()

DB_CONNECTION_TYPE = os.environ.get('SHAKECAST_DB_CONNECTION_TYPE', sc.dict['DBConnection']['type'])
DB_CONNECTION_STRING = os.environ.get('SHAKECAST_DB_CONNECTION_STRING', f'sqlite:///{os.path.join(get_db_dir(), "shakecast.db")}')

MINIMUM_MAGNITUDE = int(os.environ.get('SHAKECAST_MINIMUM_MAGNITUDE', sc.dict['Services']['new_eq_mag_cutoff']))

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
SMTP_SEND_NOTIFICATIONS = int(os.environ.get('SHAKECAST_SMTP_SEND_NOTIFICATIONS', 1))

from pathlib import Path
home = str(Path.home())
USER_DIRECTORY = os.environ.get('SHAKECAST_USER_DIRECTORY', os.path.join(home, '.shakecast'))

USER_TEMPLATE_DIR = os.environ.get(
    'SHAKECAST_USER_TEMPLATE_DIRECTORY',
    os.path.join(USER_DIRECTORY, 'templates'))

DATA_DIR = os.environ.get(
    'SHAKECAST_DATA_DIRECTORY',
    os.path.join(USER_DIRECTORY, 'data'))

USER_CONF_DIR = os.environ.get(
    'SHAKECAST_USER_CONF_DIRECTORY',
    os.path.join(USER_DIRECTORY, 'conf'))

USER_ASSETS_DIR = os.environ.get(
    'SHAKECAST_USER_ASSETS_DIRECTORY',
    os.path.join(USER_DIRECTORY, 'assets'))

USER_TMP_DIR = os.environ.get(
    'SHAKECAST_USER_TMP_DIRECTORY',
    os.path.join(USER_DIRECTORY, 'tmp'))

LOG_DIRECTORY = os.environ.get('SHAKECAST_LOG_DIRECTORY', os.path.join(USER_DIRECTORY, 'logs'))
DEBUG_LEVEL = int(os.environ.get('SHAKECAST_DEBUG_LEVEL', 0))

WEB_PORT = int(os.environ.get('SHAKECAST_WEB_PORT', sc.dict['web_port']))

RABBITMQ_HOST = os.environ.get('SHAKECAST_RABBITMQ_HOST', 'rabbitmq')
RABBITMQ_URL= os.environ.get('SHAKECAST_RABBITMQ_URL', 'amqp://guest:guest@rabbitmq:5672/%2F')
