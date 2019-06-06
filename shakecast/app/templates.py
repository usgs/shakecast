import os
import sys

from .util import get_default_template_dir, get_template_dir, sc_dir, copy_dir

def update_templates():
    custom_template_dir = get_template_dir()
    default_templates = get_default_template_dir()

    copy_dir(default_templates, custom_template_dir)

if __name__ == '__main__':
    if len(sys.argv) > 0:
        if sys.argv[1] == 'update':
            update_templates()

