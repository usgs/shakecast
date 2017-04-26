import sys
import os

top_path = os.path.dirname(os.path.abspath(__file__))
path = top_path.split(os.sep)
path += ['admin', 'Linux']
path = os.sep.join(path)
def start():
    os.system('chmod 664 ' + top_path)
    os.system('python ' + path + os.sep + 'web_server_service.py start &')
    os.system('python ' + path + os.sep + 'server_service.py start &')

def stop():
    os.system('python ' + path + os.sep + 'web_server_service.py stop')
    os.system('python ' + path + os.sep + 'server_service.py stop')


def invalid():
    print '''
    Usage:
        start - Starts the ShakeCast servers
        stop - Stops the ShakeCast servers
    '''

uid = os.getuid()
if uid == 0:
    if len(sys.argv) == 2:
        if sys.argv[1] == 'start':
            print 'Starting ShakeCast...'
            start()
            print 'Done.'
        elif sys.argv[1] == 'stop':
            print 'Stopping ShakeCast...'
            stop()
            print 'Done.'
        else:
            invalid()
    else:
        invalid()
else:
    print '''
        Run with sudo
        sudo python -m shakecast [start][stop]
    '''
