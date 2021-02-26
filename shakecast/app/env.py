# Pulls environment variables in order ot configure shakecast

import os
from .util import SC, sc_dir

sc = SC()
DB_CONNECTION_TYPE = os.environ.get('SHAKECAST_DB_CONNECTION_TYPE', sc.dict['DBConnection']['type'])
DEBUG_LEVEL = int(os.environ.get('SHAKECAST_DEBUG_LEVEL', 0))
SERVER_PORT = int(os.environ.get('SHAKECAST_SERVER_PORT', 1981))
SHAKECAST_DIRECTORY = sc_dir()
USER_DIRECTORY = os.environ.get('SHAKECAST_USER_DIRECTORY', '~/.shakecast')
WEB_PORT = os.environ.get('SHAKECAST_WEB_PORT', 80)

