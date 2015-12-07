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
    
def lognorm_opt(med=0, spread=0, step=.01, just_norm=False, shaking=False):
    start = med - (10 * spread)
    end = med + (10 * spread)
    
    arr_len = int(((end - start) / step))
    
    #p_norm = [0] * arr_len
    p_sums = [0] * arr_len
    x_coords = [0] * arr_len
    x = start
    p_sum = 0
    
    i = 0
    if shaking is False:
        while p_sum < 99.999:
    
            norm_dist = ((1 /
                            (spread * math.sqrt(2 * math.pi))) *
                            (math.e ** (-((x - med) ** 2) /
                            (2 * (spread ** 2)))))
            
            p_sum += norm_dist
            p_sums[i] = p_sum
        #    p_norm += [norm_dist]
            
            x_coords[i] = x
            x += step
            
            i += 1
            
        if just_norm is True:
            return p_norm, x_coords
        else:    
            return p_sums, x_coords
    else:
        while p_sum < 99.999:
    
            norm_dist = ((1 /
                            (spread * math.sqrt(2 * math.pi))) *
                            (math.e ** (-((x - med) ** 2) /
                            (2 * (spread ** 2)))))
            
            p_sum += norm_dist
            p_sums[i] = p_sum
        #    p_norm += [norm_dist]
            
            x_coords[i] = x
            
            if x > shaking:
                return p_sum
            
            x += step
            
            i += 1
        return 99.999    
        #if just_norm is True:
        #    return p_norm, x_coords
        #else:    
        #    return p_sums, x_coords
    
def closest(lst = [], Number = 0):
    '''
    Find the closest number in a list
    '''
    
    aux = []
    for valor in lst:
        aux.append(abs(Number-valor))

    return aux.index(min(aux))

def get_delim():
    if os.name == 'nt':
        delim = '\\'
    else:
        delim = '/'
        
    return delim