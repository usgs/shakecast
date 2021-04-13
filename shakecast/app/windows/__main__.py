import sys

from .controls import install, start, stop, uninstall

def invalid():
    print('''
    Windows specific start/stop/install command line interface

    Usage:
        start - Starts the ShakeCast servers
        stop - Stops the ShakeCast servers
        install - Installs ShakeCast services
        uninstall - Removes ShakeCast services
    ''')

def main(command = None):
    if len(sys.argv) == 2:
        command = command or sys.argv[1]

    if command == 'start':
        install()
        start()

    elif command == 'stop':
        stop()

    elif command == 'install':
        install()

    elif command == 'uninstall':
        stop()
        uninstall()

    else:
        invalid()


if __name__ == '__main__':
    main()