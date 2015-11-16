import math
import os

def lognorm(med=0, spread=0, step=.01, just_norm=False):
    start = med - (10 * spread)
    end = med + (10 * spread)
    
    p_norm = []
    p_sums = []
    x_coords = []
    x = start
    p_sum = 0
    while p_sum < 99.999:

        norm_dist = ((1 /
                        (spread * math.sqrt(2 * math.pi))) *
                        (math.e ** (-((x - med) ** 2) /
                        (2 * (spread ** 2)))))
        
        p_sum += norm_dist
        p_sums += [p_sum]
        p_norm += [norm_dist]
        
        x_coords += [x]
        x += step
        
    if just_norm is True:
        return p_norm, x_coords
    else:    
        return p_sums, x_coords
    
def closest(list, Number):
    '''
    Find the closest number in a list
    '''
    
    aux = []
    for valor in list:
        aux.append(abs(Number-valor))

    return aux.index(min(aux))

def get_delim():
    if os.name == 'nt':
        delim = '\\'
    else:
        delim = '/'
        
    return delim