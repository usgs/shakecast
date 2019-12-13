from functools import wraps
import logging
from logging.handlers import TimedRotatingFileHandler
import os
import time

from .util import get_logging_dir, SC, DAY

log_dir = get_logging_dir()
server_log_path = os.path.join(get_logging_dir(), 'sc-service.log')
web_log_path = os.path.join(get_logging_dir(), 'web-server.log')

sc = SC()
if sc.dict['Logging']['level'] == 'info':
    log_level = logging.INFO
elif sc.dict['Logging']['level'] == 'debug':
    log_level = logging.DEBUG

def get_logger(name=None, path=None, level=None, format=None):
    logger = logging.getLogger(name)
    logger.setLevel(level)

    formatter = logging.Formatter('%(asctime)s: [{}] %(levelname)-7.7s %(message)s'.format(name))
    rotating_handler = TimedRotatingFileHandler(path,
                                        when="d",
                                        interval=1,
                                        backupCount=7)

    rotating_handler.setFormatter(formatter)
    logger.addHandler(rotating_handler)

    return logger

web_logger = get_logger(
    'werkzeug',
    web_log_path,
    logging.WARNING
)

server_logger = get_logger(
    'ShakeCast Server',
    server_log_path,
    log_level
)
