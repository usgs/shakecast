import argparse
import os, sys
from multiprocessing import Process
import subprocess
import time

from .app.startup import pip_init
pip_init()

from .app.util import SC, sc_dir, on_windows
import app.windows as winControls
import app.linux as controls

if on_windows():
    # use windows controls if we're in that OS
    controls = winControls

def check_running():
    ##### replace with actual server health checks #####
    shakecast_process_count = get_shakecast_process_count()
    if shakecast_process_count < 4:
        return False
    
    return True

def get_shakecast_process_count():
    processes = subprocess.check_output(['ps', 'axww']).split('\n')
    shakecast_process_count = 0
    for process in processes:
        if 'python -m shakecast start' in process:
            shakecast_process_count += 1
    return shakecast_process_count

def invalid():
    print '''
    Usage:
        start - Starts the ShakeCast servers
        stop - Stops the ShakeCast servers
    '''

def main(command = None):
    sc = SC()
    uid = 0
    if sc.dict['web_port'] < 1024:
        try:
            uid = os.getuid()
        except Exception as e:
            # this will error in Windows, but that doesn't mean the
            # user isn't an admin... just try to install and let it
            # error if the user doesn't have privileges
            pass

    if uid == 0:
        if len(sys.argv) >= 2:
            command = command or sys.argv[1]

        if command == 'start':
            start()

        elif command == 'stop':
            shutdown()

        else:
            invalid()
    
    else:
        sudo_required()

def read_status():
    file_name = os.path.join(sc_dir(), '.status')
    with open(file_name, 'r') as file_:
        status = file_.read()
    
    return status

def sudo_required():
    sc = SC()
    print '''
            Web port {} requires sudo:
            sudo python -m shakecast [start][stop]
        '''.format(sc.dict['web_port'])

def start():
    status = 'running'
    write_status(status)
    controls.start()

    if not on_windows():
        # keep alive on linux to watch the services
        while status == 'running':
            status = read_status()
            if check_running() is False and status == 'running':
                restart_services()

            time.sleep(10)

def restart_services():
    controls.stop()
    time.sleep(10)
    controls.start()

def shutdown():
    write_status('stopped')
    controls.stop()

def write_status(status):
    file_name = os.path.join(sc_dir(), '.status')
    with open(file_name, 'w') as file_:
        file_.write(status)


if __name__ == '__main__':
    main()
