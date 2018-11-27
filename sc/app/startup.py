import os
from util import SC, sc_dir
def startup():
    if os.environ.get('SC_DOCKER', False) is not False:
        docker_init()

    if os.environ.get('SC_CI', False) is not False:
        ci_init()

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

def ci_init():
    sc = SC()
    sc.dict['SMTP']['username'] = os.environ.get('SC_SMTP_USERNAME', '')
    sc.dict['SMTP']['password'] = os.environ.get('SC_SMTP_PASSWORD', '')
    sc.dict['SMTP']['server'] = os.environ.get('SC_SMTP_SERVER', '')
    sc.dict['SMTP']['from'] = os.environ.get('SC_SMTP_FROM', '')
    sc.dict['SMTP']['security'] = os.environ.get('SC_SMTP_SECURITY', '')
    sc.dict['SMTP']['port'] = int(os.environ.get('SC_SMTP_PORT', ''))

    sc.save_dict()

    

def docker_init():
    copy_backups()

    sc = SC()
    sc.dict['host'] = 'sc-server'
    sc.dict['web_port'] = 5000
    sc.save_dict()

if __name__ == '__main__':
    startup()
