import sys

def invalid():
    print '''
    Invalid Command:
        start - Starts the ShakeCast servers
        stop - Stops the ShakeCast servers
    '''

if len(sys.argv) == 2:
    if sys.argv[1] == 'start':
        print 'START'
    elif sys.argv[1] == 'stop':
        print 'STOP'
    else:
        invalid()
else:
    invalid()
