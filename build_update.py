import os
import json
from sc.app.util import SC

COMMIT = 'e0249bfd45a0e2b38d854784c967aa53f24fafb4'
GITROOT = 'https://raw.githubusercontent.com/usgs/shakecast/master/'

def get_file_names():
    # git list of changed files from specific commit
    os.system('git diff --name-only {} > git_diff'.format(COMMIT))

    # read the list
    with open('git_diff', 'r') as f_:
        raw_lines = f_.readlines()
    
    # strip whitespace
    f_names = [l.strip() for l in raw_lines if l[0] != '.']
    os.system('rm git_diff')

    # check that files still exist
    confirmed = []
    for f_ in f_names:
        if os.path.isfile(f_):
            confirmed += [f_]

    return confirmed

def build_json(f_names, update_info='General Updates'):
    sc = SC()
    
    info = {}
    info['version'] = sc.dict['Server']['update']['software_version']
    info['info'] = update_info
    info['files'] = []

    for name in f_names:
        info['files'] += [{'url': GITROOT + name,
                            'path': name}]

    return json.dumps(info, indent=4)


if __name__ == '__main__':
    f_names = get_file_names()
    js_feed = build_json(f_names)

    with open('update.json', 'w') as f_:
        f_.write(js_feed)
        
    print js_feed

