from os.path import dirname, basename, isfile, join
import glob

# auto import all .py modules
modules = glob.glob(join(dirname(__file__), "*.py"))

# manually import non-file modules
from . import geojsonhtml

__all__ = [ basename(f)[:-3] for f in modules if isfile(f) and not f.endswith('__init__.py')]
__all__ += ['geojsonhtml']
