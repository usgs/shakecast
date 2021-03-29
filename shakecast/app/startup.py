import os
import shutil

from util import (
        SC,
        sc_dir,
        get_user_dir,
        get_template_dir,
        get_conf_dir,
        get_db_dir,
        get_logging_dir,
        get_tmp_dir,
        get_data_dir,
        get_local_products_dir
)

def startup():
    pip_init()
    if int(os.environ.get('SC_DOCKER', False)):
        docker_init()

    if os.environ.get('SC_CI', False) is not False:
        ci_init()

def copy_backups():
    dir_ = sc_dir()
    docker_templates = os.path.join(dir_, 'backups', 'templates')
    docker_conf = os.path.join(dir_, 'backups', 'conf')
    docker_assets = os.path.join(dir_, 'backups', 'assets')
    templates = os.path.join(dir_, 'templates')
    conf = os.path.join(dir_, 'conf')
    assets = os.path.join(dir_, 'view', 'assets')

    if not os.path.isdir(os.path.join(templates, 'new_event')):
        os.system('cp -r {}/* {}'.format(docker_templates, templates))
    
    if not os.path.isfile(os.path.join(conf, 'sc.json')):
        os.system('cp -r {}/* {}'.format(docker_conf, conf))

    if not os.path.isdir(assets):
    	os.system('cp -r {}/* {}'.format(docker_assets, assets))

def ci_init():
    sc = SC()
    sc.dict['SMTP']['username'] = os.environ.get('SC_SMTP_USERNAME', '')
    sc.dict['SMTP']['password'] = os.environ.get('SC_SMTP_PASSWORD', '')
    sc.dict['SMTP']['server'] = os.environ.get('SC_SMTP_SERVER', '')
    sc.dict['SMTP']['from'] = os.environ.get('SC_SMTP_FROM', '')
    sc.dict['SMTP']['security'] = os.environ.get('SC_SMTP_SECURITY', '')
    sc.dict['SMTP']['port'] = int(os.environ.get('SC_SMTP_PORT', ''))
    sc.dict['web_port'] = int(os.environ.get('SC_WEB_PORT', 5000))

    sc.save_dict()

def pip_init():
    '''
    Initialize persistent data directories for pip installization
    '''

    sc_dir_ = sc_dir()
    templates = os.path.join(sc_dir_, 'templates')
    templates_dest = get_template_dir()
    configs = os.path.join(sc_dir_, 'conf')
    configs_dest = get_conf_dir()

    if not os.path.isdir(templates_dest):
        shutil.copytree(templates, templates_dest)
    if not os.path.isdir(configs_dest):
        shutil.copytree(configs, configs_dest)

    tmp_dir = get_tmp_dir()
    if not os.path.isdir(tmp_dir):
        os.mkdir(tmp_dir)
    
    db_dir = get_db_dir()
    if not os.path.isdir(db_dir):
        os.mkdir(db_dir)

    local_prods_dir = get_local_products_dir()
    if not os.path.isdir(local_prods_dir):
        os.mkdir(local_prods_dir)

    logs_dir = get_logging_dir()
    if not os.path.isdir(logs_dir):
        os.mkdir(logs_dir)



def docker_init():
    copy_backups()

    sc = SC()
    sc.dict['host'] = 'sc-server'
    sc.dict['web_port'] = 5000
    sc.save_dict()

if __name__ == '__main__':
    startup()
