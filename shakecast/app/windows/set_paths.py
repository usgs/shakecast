import os, sys

REQUIRED_PATHS = ['C:\Python27',
        'C:\Python27\Scripts',
        'C:\Python27\Lib\site-packages\pywin32_system32',
        'C:\Python27\Lib\site-packages\win32']

def add_paths(system_path_lst):
    paths = REQUIRED_PATHS + system_path_lst
    return set(paths)

def get_path():
    path = os.environ.get('PATH')
    return path.split(';')

def main():
    path = get_path()
    path = add_paths(path)
    path = ';'.join(path)

    save_path(path)

def save_path(path):
    os.system('setx /M PATH "{}"'.format(path))


if __name__ == '__main__':
    main()
