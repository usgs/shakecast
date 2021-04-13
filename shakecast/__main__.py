import argparse
import os, sys
from multiprocessing import Process
import subprocess
import time

import shakecast.app.admin as admin
from shakecast.app.util import on_windows
import shakecast.app.windows as winControls
import shakecast.app.linux as controls
import shakecast.app.env as env

if on_windows():
    # use windows controls if we're in that OS
    controls = winControls

def check_running():
    ##### replace with actual server health checks #####
    shakecast_processes = get_shakecast_processes()

    api_check = False
    server_check = False
    for process in shakecast_processes:
        if 'shakecast.api' in process:
            api_check = True
        if 'shakecast.app.server' in process:
            server_check = True
    
    return api_check and server_check

def get_shakecast_processes():
    processes = subprocess.check_output(['ps', 'axww']).decode('utf-8').split('\n')
    shakecast_processes = []
    for process in processes:
        if ('shakecast.api' in process
              or 'shakecast.app.server' in process
              and process not in shakecast_processes):
            shakecast_processes += [process]
  
    return processes

def invalid():
    print('''
    Usage:
        start - Starts the ShakeCast servers
        stop - Stops the ShakeCast servers
    ''')

def main(command = None):
    if len(sys.argv) >= 2:
        command = command or sys.argv[1]

    if command == 'start':
        start()

    elif command == 'stop':
        shutdown()

    # pass command through to admin module
    elif hasattr(admin, command):
        getattr(admin, command)()

    else:
        invalid()

def read_status():
    file_name = os.path.join(env.SHAKECAST_DIRECTORY, '.status')
    with open(file_name, 'r') as file_:
        status = file_.read()
    
    return status

def start():
    status = 'running'
    write_status(status)
    controls.start()

    if not on_windows():
      while status == 'running':
          status = read_status()
          if check_running() is False and status == 'running':
              print('Restarting services...')
              restart_services()
          time.sleep(10)

def restart_services():
  try:
    controls.start()
  except Exception:
    print('''
    Processes already running or unable to start.
    ''')

def shutdown():
    write_status('stopped')
    controls.stop()

def write_status(status):
    file_name = os.path.join(env.SHAKECAST_DIRECTORY, '.status')
    with open(file_name, 'w') as file_:
        file_.write(status)


if __name__ == '__main__':
    main()
