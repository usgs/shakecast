import math
import os

"""
Functions used by the db_alchemy module
"""

def lognorm_opt(med=0, spread=0, step=.01, just_norm=False, shaking=False):
    p_norm = (math.erf((shaking-med)/(math.sqrt(2) * spread)) + 1)/2
    return p_norm * 100        
    
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
    if os.name == 'nt':
        delim = '\\'
    else:
        delim = '/'
    return delim