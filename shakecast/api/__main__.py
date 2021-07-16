import sys

from shakecast.app.env import WEB_PORT

from .app import create_app

flask_app = create_app()

def start():
    print('Running on web server on port: {}'.format(WEB_PORT))
    flask_app.run(host='0.0.0.0', port=int(WEB_PORT))

if __name__ == '__main__':
    if len(sys.argv) > 1:
        if sys.argv[1] == '-d':
            # run in debug mode
            flask_app.run(host='0.0.0.0', port=int(WEB_PORT), debug=True)
    else:
        start()

