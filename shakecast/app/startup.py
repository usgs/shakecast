import os
import shutil

from util import SC, sc_dir, get_user_dir

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
    sc.dict['user_directory'] = '.'

    sc.save_dict()

def pip_init():
    '''
    Initialize persistent data directories for pip installization
    '''

    sc = SC()
    user_dir = get_user_dir()
    sc_dir_ = sc_dir()
    if not os.path.isdir(user_dir):
        templates = os.path.join(sc_dir_, 'templates')
        templates_dest = os.path.join(user_dir, 'templates')
        db = os.path.join(sc_dir_, 'db')
        db_dest = os.path.join(user_dir, 'db')
        configs = os.path.join(sc_dir_, 'conf')
        configs_dest = os.path.join(user_dir, 'conf')
        logs = os.path.join(sc_dir_, 'logs')
        logs_dest = os.path.join(user_dir, 'logs')
        local_prods = os.path.join(sc_dir_, 'local_products')
        local_prods_dest = os.path.join(user_dir, 'local_products')
        tmp = os.path.join(sc_dir_, 'tmp')
        tmp_dest = os.path.join(user_dir, 'tmp')
        data = os.path.join(sc_dir_, 'data')
        data_dest = os.path.join(user_dir, 'data')

        shutil.copytree(templates, templates_dest)
        shutil.copytree(db, db_dest)
        shutil.copytree(configs, configs_dest)
        shutil.copytree(logs, logs_dest)
        shutil.copytree(local_prods, local_prods_dest)
        shutil.copytree(tmp, tmp_dest)
        shutil.copytree(data, data_dest)



def docker_init():
    copy_backups()

    sc = SC()
    sc.dict['host'] = 'sc-server'
    sc.dict['web_port'] = 5000
    sc.dict['user_directory'] = '.'
    sc.save_dict()

if __name__ == '__main__':
    startup()
