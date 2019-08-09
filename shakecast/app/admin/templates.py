import json
import os
import shutil

from ..startup import startup
from ..util import get_conf_dir, get_template_dir, merge_dicts, SC, sc_dir

def update_templates():
    temp_dir = get_template_dir()
    shutil.rmtree(temp_dir)

    startup()

def update_configs():
    sc = SC()

    new_config_file = os.path.join(sc_dir(), 'conf', 'sc.json')
    with open(new_config_file, 'r') as file_:
        new_configs = json.loads(file_.read())
    
    merge_dicts(new_configs, sc.dict)

    sc.dict = new_configs
    sc.save_dict()