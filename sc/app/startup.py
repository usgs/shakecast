import os
from util import SC, sc_dir
def startup():
    if os.environ.get('SC_DOCKER', False) is not False:
        docker_init()

def docker_init():
    sc = SC()
    sc.dict['host'] = 'sc-server'
    sc.save_dict()

    dir_ = sc_dir()
    docker_templates = os.path.join(dir_, 'backups', 'templates')
    templates = os.path.join(dir_, 'templates')

    os.system('cp -r {}/* {}'.format(docker_templates, templates))
