import json
import os
import time

from shakecast.app.env import USER_TMP_DIR

def get_file_type(file_name):
    ext = file_name.split('.')[-1]
    if ext in ['jpg', 'jpeg', 'png', 'bmp']:
        return 'image'
    elif ext in ['xml']:
        return 'xml'

def parse_args(args_in):
    args = {}
    for key in list(args_in.keys()):
      args[key] = json.loads(args_in[key])

    return args

def record_messages(message):
    fname = os.path.join(USER_TMP_DIR, 'server-messages.json')

    if not os.path.isfile(fname):
      with open(fname, 'w') as file_:
          file_.write('{}')

    current_messages = {}
    with open(fname, 'r') as file_:
        current_messages_str = file_.read()
        current_messages = json.loads(current_messages_str)

    current_time = time.time()
    keep_messages = {}
    # figure out which current messages we should keep
    for key in list(current_messages.keys()):
        if float(key) > current_time - 300:
            keep_messages[key] = current_messages[key]

    # add current messages
    keep_messages[str(current_time)] = message

    keep_messages_str = json.dumps(keep_messages, indent=4)
    with open(fname, 'w') as file_:
        file_.write(keep_messages_str)
