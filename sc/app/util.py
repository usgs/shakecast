import math
import os

"""
Functions used by the functions module
"""

def closest(lst = [], Number = 0):
    '''
    Find the closest number in a list
    '''
    
    aux = []
    for valor in lst:
        aux.append(abs(Number-valor))

    return aux.index(min(aux))

def get_delim():
    """
    Returns which delimeter is appropriate for the operating system
    """
    return os.sep

def sc_dir():
    """
    Returns the path of the sc directory for the shakecast application
    """
    path = os.path.dirname(os.path.abspath(__file__))
    delim = get_delim()
    path = path.split(delim)
    del path[-1]
    directory = os.path.normpath(delim.join(path))
    
    return directory

def lognorm_opt(med=0, spread=0, step=.01, just_norm=False, shaking=False):
    p_norm = (math.erf((shaking-med)/(math.sqrt(2) * spread)) + 1)/2
    return p_norm * 100  