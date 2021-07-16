import os

from shakecast.app.env import DB_CONNECTION_TYPE

from .controllers.main import routes
from .controllers.main import app as main_app

def create_app():
    if os.environ.get('SHAKECAST_APP_ENV') == 'testing':
        main_app.config['TESTING'] = True
        main_app.config['WTF_CSRF_ENABLED'] = False
        main_app.config['DEBUG'] = False

    main_app.register_blueprint(routes)
    if DB_CONNECTION_TYPE == 'sqlite':
      from .controllers.syncmodels import routes as sync_routes
      main_app.register_blueprint(sync_routes)
    else:
      from .controllers.asyncmodels import routes as async_routes
      main_app.register_blueprint(async_routes)
    return main_app


app = create_app()

if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=80, debug=True)
