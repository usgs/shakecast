from functools import wraps
import logging
import os
import time

from .util import get_logging_dir, SC, DAY

CURRENT_LOG_COUNT = 1
LOG_CREATE_TIMESTAMP = 0
MAX_LOG_SIZE = 1000000
MAX_LOG_COUNT = 7

log_dir = get_logging_dir()
log_path = os.path.join(get_logging_dir(), 'sc-service.log')
sc = SC()
if sc.dict['Logging']['level'] == 'info':
    log_level = logging.INFO
elif sc.dict['Logging']['level'] == 'debug':
    log_level = logging.DEBUG

logging.basicConfig(
    filename = os.path.normpath(log_path),
    level = log_level, 
    format = '%(asctime)s: [ShakeCast Server] %(levelname)-7.7s %(message)s')

def check_size_to_create_new():
    log_size = os.path.getsize(log_path)
    return log_size > MAX_LOG_SIZE

def move_log():
    global CURRENT_LOG_COUNT

    os.rename(log_path, '{}{}'.format(log_path, CURRENT_LOG_COUNT))
    CURRENT_LOG_COUNT += 1

    if CURRENT_LOG_COUNT > MAX_LOG_COUNT:
        CURRENT_LOG_COUNT = 1

def get_new_log():
    '''
    Add a new log to the logging handler
    '''

    fileh = logging.FileHandler(log_path, 'a')
    formatter = logging.Formatter('%(asctime)s: [ShakeCast Server] %(levelname)-7.7s %(message)s')
    fileh.setFormatter(formatter)

    log = logging.getLogger()  # root logger
    for hdlr in log.handlers[:]:  # remove all old handlers
        log.removeHandler(hdlr)
    log.addHandler(fileh)      # set the new handler

def logging_check(func):
    '''
    Determine whether logs should be rolled before logging
    '''

    @wraps(func)
    def inner(*args, **kwargs):
        if check_size_to_create_new() is True:
            move_log()
            get_new_log()
        
        func(*args, **kwargs)

    return inner

@logging_check
def info(log_str):
    logging.info(log_str)

@logging_check
def debug(log_str):
    logging.debug(log_str)
