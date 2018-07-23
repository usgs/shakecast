from damage import get_damage_state_medians, get_default_damage_state_beta
from data_tables import modal_height, modal_weight, modal_shape_factor

import math

def get_modal_response(mbt, bid, stories):
    complete = {}
    if mbt == 'W1' or mbt == 'W1a':
        if bid == 4 or bid == 6 or bid == 7:
            complete = {
                1: 1.00,
                2: 2.03,
                3: 2.50,
                4: 2.50,
                5: 2.50,
                6: 2.50,
                7: 2.50,
                8: 2.50,
                9: 2.50,
                10: 2.50,
                11: 2.50,
                12: 2.50,
                13: 2.50,
                14: 2.50,
                15: 2.50,
                100: 2.50
            }
        elif bid == 3 or bid == 5:
            complete = {
                1: 1.00,
                2: 1.62,
                3: 2.04,
                4: 2.36,
                5: 2.63,
                6: 2.87,
                7: 3.07,
                8: 3.26,
                9: 3.43,
                10: 3.59,
                11: 3.73,
                12: 3.87,
                13: 4.0,
                14: 4.0,
                15: 4.0,
                100: 4.0
            }
        else:
            complete = {
                1: 1.00,
                2: 1.62,
                3: 2.04,
                4: 2.36,
                5: 2.63,
                6: 2.87,
                7: 3.07,
                8: 3.26,
                9: 3.43,
                10: 3.59,
                11: 3.73,
                12: 3.87,
                13: 4.0,
                14: 4.12,
                15: 4.23,
                100: 4.23
            }
    elif bid == 1 or bid == 2:
        complete = {
            1: 1.00,
            2: 1.21,
            3: 1.35,
            4: 1.45,
            5: 1.54,
            6: 1.62,
            7: 1.69,
            8: 1.75,
            9: 1.81,
            10: 1.86,
            11: 1.91,
            12: 1.96,
            13: 2.0,
            14: 2.04,
            15: 2.08,
            100: 2.08
        }
    elif bid == 6 or bid == 7:
        complete = {
            1: 1.00,
            2: 2.03,
            3: 2.50,
            4: 2.50,
            5: 2.50,
            6: 2.50,
            7: 2.50,
            8: 2.50,
            9: 2.50,
            10: 2.50,
            11: 2.50,
            12: 2.50,
            13: 2.50,
            14: 2.50,
            15: 2.50,
            100: 2.50
        }
    elif bid == 4:
        complete = {
            1: 1.0,
            2: 2.03,
            3: 2.73,
            4: 3.27,
            5: 3.72,
            6: 4.0,
            7: 4.0,
            8: 4.0,
            9: 4.0,
            10: 4.0,
            11: 4.0,
            12: 4.0,
            13: 4.0,
            14: 4.0,
            15: 4.0,
            100: 4.0
        }
    else:
        complete = {
            1: 1.00,
            2: 1.62,
            3: 2.04,
            4: 2.36,
            5: 2.63,
            6: 2.87,
            7: 3.07,
            8: 3.26,
            9: 3.43,
            10: 3.59,
            11: 3.73,
            12: 3.87,
            13: 4.0,
            14: 4.0,
            15: 4.0,
            100: 4.0
        }

    shape = modal_shape_factor[stories]
    shape['complete'] = complete[stories]
    shape['extensive'] = (shape['slight'] + shape['complete']) / 2.0

    return shape



def get_modal_height(mbt, stories):
    return modal_height[stories].get(
        mbt,
        modal_height[stories].get('other', None)
    )

def get_modal_weight(mbt, stories):
    return modal_weight[stories].get(
        mbt,
        modal_weight[stories].get('other', None)
    )

def get_seismic_design(design_period, mbt, sdl):

    mbt_factor = {
        'S1': 12,
        'C1': 12,
        'S4': 10,
        'RM1': 6,
        'RM2': 6,
        'URM': 6,
        'W1': 6,
        'W1A': 6,
        'other': 8
    }

    design_factor = {
        'MH': 1/1.375,
        'special': 1.5,
        'high': 1,
        'moderate': .5,
        'low': .25,
        'other': .25
    }

    design_val = 2.75 if design_period**(2/3) > 2.75 else 1.25 * 1.5 / design_period**(2/3)

    return (
        design_val / 
        mbt_factor.get(mbt, mbt_factor['other']) *
        design_factor.get(mbt, design_factor.get(sdl), design_factor['other'])
    )

def get_default_period(mbt, sdl, height):
    c_u = {
        'special': 1.4,
        'high': 1.4,
        'moderate': 1.5,
        'low': 1.6,
        'other': 1.7
    }

    x = {
        'C1': .9,
        'C2': .75,
        'C3': .75,
        'MH': .75,
        'PC1': .75,
        'PC2': .75,
        'RM1': .75,
        'RM2': .75,
        'S1': .8,
        'S2': .75,
        'S3': .75,
        'S4': .75,
        'S5': .75,
        'URM': .75,
        'W1': .75,
        'W1A': .75,
        'W2': .75,
        'other': .75
    }

    c_r = {
        'C1': .016,
        'C2': .0215,
        'C3': .0215,
        'MH': .025,
        'PC1': .025,
        'PC2': .0215,
        'RM1': .0215,
        'RM2': .0125,
        'S1': .028,
        'S2': .0285,
        'S3': .025,
        'S4': .0215,
        'S5': .0215,
        'URM': .0215,
        'W1': .025,
        'W1A': .025,
        'W2': .025,
        'other': .025
    }

    elastic_period = (
            c_u.get(sdl, c_u['other']) *
            c_r.get(mbt, c_r['other']) * 
            height ** x.get(mbt, x['other'])
    )

    return elastic_period

def get_design_period(mbt, sdl, height):

    x = {
        'C1': .9,
        'C2': .75,
        'C3': .75,
        'MH': .75,
        'PC1': .75,
        'PC2': .75,
        'RM1': .75,
        'RM2': .75,
        'S1': .8,
        'S2': .75,
        'S3': .75,
        'S4': .75,
        'S5': .75,
        'URM': .75,
        'W1': .75,
        'W1A': .75,
        'W2': .75,
        'other': .75
    }

    c_r = {
        'C1': .016,
        'C2': .0215,
        'C3': .0215,
        'MH': .025,
        'PC1': .025,
        'PC2': .0215,
        'RM1': .0215,
        'RM2': .0125,
        'S1': .028,
        'S2': .0285,
        'S3': .025,
        'S4': .0215,
        'S5': .0215,
        'URM': .0215,
        'W1': .025,
        'W1A': .025,
        'W2': .025,
        'other': .025
    }

    design_period = (
            c_r.get(mbt, c_r['other']) * 
            height ** x.get(mbt, x['other'])
    )

    return design_period

def get_pre_yield(stories):
    lookup = {
        1:	2.70,
        2:	2.50,
        3:	2.25,
        4:	2.00,
        5:	1.88,
        6:	1.80,
        7:	1.75,
        8:	1.71,
        9:	1.69,
        10:	1.67,
        11:	1.65,
        12:	1.65,
        13:	1.65,
        14:	1.65,
        15:	1.65
    }

    if stories > 15:
        stories = 15

    return lookup.get(stories, None)

def get_post_yield(mbt, bid):
    post_yield = 0
    if (mbt == 'W1' or mbt == 'W1A' or mbt == 'S1' or 
            mbt == 'C1' or mbt == 'W2' or mbt == 'C2'):
        if bid == 5 or bid == 6:
            post_yield = 1.75
        elif bid == 7:
            post_yield = 1.5
        else:
            post_yield = 2.0

    elif mbt == 'S4' or mbt == 'C3':
        if bid == 5 or bid == 6:
            post_yield = 1.63
        elif bid == 7:
            post_yield = 1.42
        else:
            post_yield = 1.83

    elif mbt == 'PC1' or mbt == 'URM':
        if bid == 5 or bid == 6:
            post_yield = 1.25
        elif bid == 7:
            post_yield = 1.17
        else: 
            post_yield = 1.33
      
    else:
        if bid == 5 or bid == 6:
            post_yield = 1.5
        elif bid == 7:
            post_yield = 1.33
        else:
            post_yield = 1.67
      
    return post_yield
    
def get_design_coefficient(design_period, mbt, sdl):
    mbt_lookup = {
      'S1': 12,
      'C1': 12,
      'S4': 10,
      'RM1': 6,
      'RM2': 6,
      'URM': 6,
      'W1': 6,
      'W1A': 6,
      'other': 8
    }

    sdl_lookup = {
        'MH': 1/1.375,
        'special': 1.5,
        'high': 1,
        'moderate': .5,
        'low': .25,
        'other': .25
    }

    design_val = 1.25 * 1.5 / design_period ** (2.0/3.0)
    if design_val > 2.75:
        design_val = 2.75

    mbt_val = mbt_lookup.get(mbt, mbt_lookup['other'])
    sdl_val = sdl_lookup.get(mbt, sdl_lookup.get(sdl, sdl_lookup['other']))

    return 8 / 5.5 * .4 * design_val / mbt_val * sdl_val

def get_max_strength(pre_yield, post_yield, modal_weight, design_coefficient):
    return design_coefficient * pre_yield * post_yield / modal_weight

def get_ductility(stories):
    if stories > 15:
        stories = 15

    lookup = {
        1: 6.00,
        2: 6.00,
        3: 4.94,
        4: 4.41,
        5: 4.07,
        6: 3.82,
        7: 3.63,
        8: 3.48,
        9: 3.35,
        10:	3.24,
        11:	3.15,
        12:	3.07,
        13:	3.00,
        14:	3.00,
        15:	3.00
    }

    return lookup[stories]

def get_yield_point(design_coefficient, elastic_period, modal_weight, pre_yield):
  a_y = design_coefficient * pre_yield / modal_weight
  d_y = 386.08858 / (4 * math.pi**2) * a_y * elastic_period**2

  return {'x': d_y, 'y': a_y}

def get_ultimate_point(ductility, a_y, d_y, post_yield):
  a_u = a_y * post_yield
  d_u = ductility * d_y * post_yield

  return {'x': d_u, 'y': a_u}

def get_ultimate_period(d, a):
    return math.sqrt(a / (d * 9.779738))
def get_elastic_damping(mbt):
    lookup = {
        'C1': .07,
        'C2': .07,
        'C3': .07,
        'MH': .05,
        'PC1': .07,
        'PC2': .07,
        'RM1': .07,
        'RM2': .07,
        'S1': .05,
        'S2': .05,
        'S3': .05,
        'S4': .05,
        'S5': .05,
        'URM': .07,
        'W1': .1,
        'W1A': .1,
        'W2': .1
    }

    return lookup.get(mbt, .07)
def get_capacity_curve(d_y, a_y, d_u, a_u):
    k = (a_u**2 - a_y**2 + a_y**2 * (d_y - d_u) / d_y) / (2 * (a_u - a_y) + (a_y / d_y) * (d_y - d_u))
    b = a_u - k
    a = math.sqrt(d_y / a_y * b**2 * (d_u - d_y) / (a_y - k))

    # pick 10 points between dy and du
    incr = (d_u - d_y) / 10

    d = d_y + incr
    points = [{'x': 0, 'y': 0}, {'x': d_y, 'y': a_y}]
    while d < d_u:
        point = {
            'x': d,
            'y': b * math.sqrt((1 - (d - d_u)**2 / a**2)) + k
        }

        points += [point]
        d += incr
    
    points += [{'x': d_u, 'y': a_u}, {'x': d_u * 100, 'y': a_u}]

    return points

def get_capacity(mbt, sdl, bid, performance_rating, quality_rating, height, stories, year, elastic_period=None, 
        elastic_damping=None, design_period=None, ultimate_period=None, design_coefficient=None, modal_weight=None,
        modal_height=None, modal_response=None, pre_yield=None, post_yield=None,
        max_strength=None, ductility=None, default_damage_state_beta=None):

    elastic_period = elastic_period if elastic_period else get_default_period(mbt, sdl, height)
    design_period = design_period if design_period else get_design_period(mbt, sdl, height)
    design_coefficient = design_coefficient if design_coefficient else get_design_coefficient(design_period, mbt, sdl)
    elastic_damping = get_elastic_damping(mbt)
    modal_weight = modal_weight if modal_weight else get_modal_weight(mbt, stories)
    modal_height = modal_height if modal_height else get_modal_height(mbt, stories)
    modal_response = modal_response if modal_response else get_modal_response(mbt, bid, stories)
    pre_yield = pre_yield if pre_yield else get_pre_yield(stories)
    post_yield = post_yield if post_yield else get_post_yield(mbt, bid)
    max_strength = max_strength if max_strength else get_max_strength(pre_yield, post_yield, modal_weight, design_coefficient)
    ductility = ductility if ductility else get_ductility(stories)
    default_damage_state_beta = (
        default_damage_state_beta if default_damage_state_beta else 
        get_default_damage_state_beta(quality_rating, performance_rating, year, stories)
    )

    yield_point = get_yield_point(design_coefficient, elastic_period, modal_weight, pre_yield)
    ultimate_point = get_ultimate_point(ductility, yield_point['x'], yield_point['y'], post_yield)
    ultimate_period = ultimate_period if ultimate_period else get_ultimate_period(ultimate_point['x'], ultimate_point['y'])
    damage_state_medians = get_damage_state_medians(mbt, sdl, performance_rating, height, modal_height, modal_response)
    capacity_curve = get_capacity_curve(yield_point['x'], yield_point['y'], ultimate_point['x'], ultimate_point['y'])

    return {
          'elastic_period': elastic_period,
          'elastic_damping': elastic_damping,
          'design_period': design_period,
          'design_coefficient': design_coefficient,
          'modal_weight': modal_weight,
          'modal_height': modal_height,
          'modal_response': modal_response,
          'pre_yield': pre_yield,
          'post_yield': post_yield,
          'max_strength': max_strength,
          'ductility': ductility,
          'damage_state_medians': damage_state_medians,
          'yield_point': yield_point,
          'ultimate_point': ultimate_point,
          'ultimate_period': ultimate_period,
          'curve': capacity_curve,
          'year': year,
          'default_damage_state_beta': default_damage_state_beta,
          'stories': stories,
          'quality_rating': quality_rating,
          'performance_rating': performance_rating
    }


if __name__ == '__main__':
    # tests....
    get_capacity('W1', 'high', 1, 'baseline', 'best', 24, 2, 1975)