import os
from util import SC, sc_dir
def startup():
    if os.environ.get('SC_DOCKER', False) is not False:
        docker_init()

def copy_backups():
    dir_ = sc_dir()
    docker_templates = os.path.join(dir_, 'backups', 'templates')
    docker_conf = os.path.join(dir_, 'backups', 'conf')
    templates = os.path.join(dir_, 'templates')
    conf = os.path.join(dir_, 'conf')

    if not os.path.isdir(os.path.join(templates, 'new_event')):
        os.system('cp -r {}/* {}'.format(docker_templates, templates))
    
    if not os.path.isfile(os.path.join(conf, 'sc.json')):
        os.system('cp -r {}/* {}'.format(docker_conf, conf))
    

def docker_init():
    copy_backups()

    sc = SC()
    sc.dict['host'] = 'sc-server'
    sc.dict['web_port'] = 5000
    sc.save_dict()
