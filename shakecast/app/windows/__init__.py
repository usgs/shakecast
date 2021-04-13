from ..util import on_windows

# Initialize control functions to be shadowed by real controls if
# the user is on Windows
def start():
    pass
def stop():
    pass
def install():
    pass
def uninstall():
    pass

# overwrite with real functions only if we're on windows. Allows Linux
# functions to import and run without windows libraries
if on_windows():
    from . import controls
    start = controls.start
    stop = controls.stop
    install = controls.install
    uninstall = controls.uninstall
