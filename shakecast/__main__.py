import argparse
import os, sys
from multiprocessing import Process
import subprocess
import time

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

    start_services()
    while status == 'running':
        status = read_status()
        if check_running() is False and status == 'running':
            restart_services()

        time.sleep(10)

def restart_services():
    stop_services()
    time.sleep(10)
    start_services()

def shutdown():
    write_status('stopped')
    stop_services()

def start_services():
    server = ShakecastServer()
    p = Process(target=server.start)
    p.name = 'ShakeCast-Server'
    p.daemon = True
    p.start()

    server = ShakecastWebServer()
    p = Process(target=server.start)
    p.name = 'ShakeCast-Web-Server'
    p.daemon = True
    p.start()

def stop_services():
    server = ShakecastServer()
    server.stop()
    server = ShakecastWebServer()
    server.stop()

def write_status(status):
    file_name = os.path.join(sc_dir(), '.status')
    with open(file_name, 'w') as file_:
        file_.write(status)


if __name__ == '__main__':
    from .app.startup import pip_init
    pip_init()

    from .admin.server_service import ShakecastServer
    from .admin.web_server_service import ShakecastWebServer
    from .app.util import SC, sc_dir

    sc = SC()
    uid = 0
    if sc.dict['web_port'] < 1024:
        uid = os.getuid()

    if uid == 0:
        command = None
        if len(sys.argv) == 2:
            command = sys.argv[1]

        if command == 'start':
            start()

        elif command == 'stop':
            shutdown()
        else:
            invalid()
    
    else:
        sudo_required()
