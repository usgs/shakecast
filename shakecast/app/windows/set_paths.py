import os, sys

REQUIRED_PATHS = ['C:\Python27',
        'C:\Python27\Scripts',
        'C:\Python27\Lib\site-packages\pywin32_system32',
        'C:\Python27\Lib\site-packages\win32']

def add_paths(system_path_lst):
    paths = REQUIRED_PATHS + system_path_lst
    return paths

def remove_paths(system_path_lst):
    paths = []
    for path in system_path_lst:
        if path not in REQUIRED_PATHS and path:
            paths.append(path)

    return paths

def get_path():
    path = os.environ.get('PATH')
    return path.split(';')

def main():
    action = 'add'
    if len(sys.argv) > 1:
        action = sys.argv[1]

    path = get_path()
    if action == 'add':
        path = add_paths(path)
    if action == 'remove':
        path = remove_paths(path)

    path = set(path)
    path = ';'.join(path)
    save_path(path)

def save_path(path):
    os.system('setx /M PATH "{}"'.format(path))


if __name__ == '__main__':
    main()
