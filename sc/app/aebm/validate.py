import matplotlib
matplotlib.use('TkAgg')

import matplotlib.pyplot as plt

from performance_point import performance_point
from demand import get_demand
from spectrum import build_spectrum
from damage import *
from capacity import *
import aebm

hazard_x = [
    0.010,
    0.020,
    0.030,
    0.050,
    0.075,
    0.10,
    0.15,
    0.20,
    0.25,
    0.30,
    0.38,
    0.40,
    0.45,
    0.50,
    0.55,
    0.60,
    0.65,
    0.70,
    0.75,
    0.80,
    0.930,
    1.0,
    1.1,
    1.2,
    1.30,
    1.4,
    1.5,
    1.6,
    1.8,
    2.0,
    2.2,
    2.4,
    2.6,
    2.8,
    3.0,
    3.2,
    3.4,
    3.6,
    3.8,
    4.0,
    4.5,
    5.0,
    5.5,
    6.0,
    6.5,
    7.0,
    7.5,
    8.0,
    9.0,
    10.0
]

hazard_y = [
    0.4824,
    0.4836,
    0.4980,
    0.5615,
    0.6765,
    0.7848,
    0.9696,
    1.0827,
    1.1377,
    1.1456,
    1.1399,
    1.1385,
    1.1103,
    1.0850,
    1.0454,
    1.0093,
    0.9761,
    0.9453,
    0.9166,
    0.8905,
    0.8302,
    0.8002,
    0.759,
    0.721,
    0.686,
    0.653,
    0.623,
    0.595,
    0.543,
    0.496,
    0.454,
    0.416,
    0.381,
    0.348,
    0.318,
    0.297,
    0.278,
    0.259,
    0.242,
    0.226,
    0.195,
    0.168,
    0.149,
    0.132,
    0.116,
    0.102,
    0.088,
    0.080,
    0.067,
    0.054,
]

hazard = []
for i in range(len(hazard_x)):
    hazard += [{'x': hazard_x[i], 'y': hazard_y[i]}]

capacity_x = [
    0.00,
    0.00,
    0.00,
    0.00,
    0.00,
    0.00,
    0.00,
    0.00,
    0.00,
    0.00,
    0.94,
    1.07,
    1.40,
    1.77,
    2.17,
    2.62,
    3.11,
    3.65,
    4.22,
    4.83,
    6.57,
    7.60,
    9.20,
    10.95,
    12.85,
    14.90,
    17.11,
    19.46,
    24.64,
    30.41,
    36.80,
    43.80,
    51.40,
    59.61,
    68.43,
    77.86,
    87.90,
    98.54,
    109.79,
    121.65,
    153.97,
    190.09,
    230.00,
    273.72,
    321.24,
    372.57,
    427.69,
    486.62,
    615.88,
    760.34,
    76034.19
]

capacity_y = [
    0.000,
    0.000,
    0.000,
    0.000,
    0.000,
    0.000,
    0.000,
    0.000,
    0.000,
    0.000,
    0.666,
    0.686,
    0.708,
    0.722,
    0.734,
    0.744,
    0.753,
    0.761,
    0.767,
    0.772,
    0.777,
    0.777,
    0.777,
    0.777,
    0.777,
    0.777,
    0.777,
    0.777,
    0.777,
    0.777,
    0.777,
    0.777,
    0.777,
    0.777,
    0.777,
    0.777,
    0.777,
    0.777,
    0.777,
    0.777,
    0.777,
    0.777,
    0.777,
    0.777,
    0.777,
    0.777,
    0.777,
    0.777,
    0.777,
    0.777,
    0.777
]

pref_periods = [
    0.0100,
    0.0200,
    0.0300,
    0.0500,
    0.0750,
    0.1000,
    0.1500,
    0.2000,
    0.2500,
    0.3000,
    0.3500,
    0.4000,
    0.4500,
    0.5000,
    0.5500,
    0.6000,
    0.6500,
    0.7000,
    0.7500,
    0.8000,
    0.9000,
    1.0000,
    1.1000,
    1.2000,
    1.3000,
    1.4000,
    1.5000,
    1.6000,
    1.8000,
    2.0000,
    2.2000,
    2.4000,
    2.6000,
    2.8000,
    3.0000,
    3.2000,
    3.4000,
    3.6000,
    3.8000,
    4.0000,
    4.5000,
    5.0000,
    5.5000,
    6.0000,
    6.5000,
    7.0000,
    7.5000,
    8.0000,
    9.0000,
   10.0000
]

kappa = .5
mag = 7.9
hazard_beta = .4
rRup = 11.18

check = [
    {'x': .01, 'disp': 0, 'y': 0.4800},
    {'x': .02, 'disp': 0.0020, 'y': 0.4800},
    {'x': .03, 'disp': 0.0040, 'y': 0.4900},
    {'x': .05, 'disp': 0.0130, 'y': 0.5500},
    {'x': .075, 'disp': 0.0360, 'y': 0.6500},
    {'x': .1, 'disp': 0.0720, 'y': 0.7400},
    {'x': .15, 'disp': 0.1950, 'y': 0.8800},
    {'x': .2, 'disp': 0.3800, 'y': 0.9700},
    {'x': .25, 'disp': 0.6200, 'y': 1.0100},
    {'x': .3, 'disp': 0.8960, 'y': 1.0200},
    {'x': .38, 'disp': 1.4240, 'y': 1.0100},
    {'x': .4, 'disp': 1.5780, 'y': 1.0100},
    {'x': .45, 'disp': 1.7280, 'y': 0.8700},
    {'x': .5, 'disp': 1.8200, 'y': 0.7400},
    {'x': .55, 'disp': 2.0180, 'y': 0.6800},
    {'x': .6, 'disp': 2.2000, 'y': 0.6200},
    {'x': .65, 'disp': 2.3630, 'y': 0.5700},
    {'x': .7, 'disp': 2.5020, 'y': 0.5200},
    {'x': .75, 'disp': 2.6170, 'y': 0.4800},
    {'x': .8, 'disp': 2.8480, 'y': 0.4600},
    {'x': .93, 'disp': 3.4400, 'y': 0.4100},
    {'x': 1.0, 'disp': 3.7490, 'y': 0.3800},
    {'x': 1.1, 'disp': 4.2500, 'y': 0.3600},
    {'x': 1.2, 'disp': 4.7470, 'y': 0.3400},
    {'x': 1.3, 'disp': 5.2380, 'y': 0.3200},
    {'x': 1.4, 'disp': 5.7180, 'y': 0.3000},
    {'x': 1.5, 'disp': 6.1840, 'y': 0.2800},
    {'x': 1.6, 'disp': 6.6940, 'y': 0.2700},
    {'x': 1.8, 'disp': 7.6850, 'y': 0.2400},
    {'x': 2.0, 'disp': 8.6220, 'y': 0.2200},
    {'x': 2.2, 'disp': 9.5840, 'y': 0.2000},
   {'x': 2.4, 'disp': 10.4800, 'y': 0.1900},
   {'x': 2.6, 'disp': 11.2970, 'y': 0.1700},
   {'x': 2.8, 'disp': 12.0200, 'y': 0.1600},
   {'x': 3.0, 'disp': 12.6380, 'y': 0.1400},
   {'x': 3.2, 'disp': 13.4900, 'y': 0.1300},
   {'x': 3.4, 'disp': 14.2830, 'y': 0.1300},
   {'x': 3.6, 'disp': 14.9390, 'y': 0.1200},
   {'x': 3.8, 'disp': 15.5150, 'y': 0.1100},
   {'x': 4.0, 'disp': 16.0060, 'y': 0.1000},
   {'x': 4.5, 'disp': 17.4660, 'y': 0.0900},
   {'x': 5.0, 'disp': 18.4930, 'y': 0.0800},
   {'x': 5.5, 'disp': 19.8850, 'y': 0.0700},
   {'x': 6.0, 'disp': 20.9550, 'y': 0.0600},
   {'x': 6.5, 'disp': 21.6650, 'y': 0.0500},
   {'x': 7.0, 'disp': 21.9770, 'y': 0.0500},
   {'x': 7.5, 'disp': 21.9780, 'y': 0.0400},
   {'x': 8.0, 'disp': 23.5220, 'y': 0.0400},
   {'x': 9.0, 'disp': 26.3260, 'y': 0.0300},
   {'x': 10.0, 'disp': 28.1730, 'y': 0.0300}
]

def isclose(a, b, rel_tol=1e-09, abs_tol=0.0):
    return abs(a-b) <= max(rel_tol * max(abs(a), abs(b)), abs_tol)

def validate_damage_states():
    # validation
    validation = {
      '1': {
          'mbt': 'C2',
          'sdl': 'pre',
          'perf_rating': 'baseline',
          'floors_ag': 4,
          'height': 45,
          'alpha1': .8,
          'alpha2': .75,
          'bid': 1,
          'expected': {
            'slight': .84,
            'moderate': 1.67,
            'extensive': 4.46,
            'complete': 11.14
          }
      },
      '2': {
          'mbt': 'C2',
          'sdl': 'low',
          'perf_rating': 'baseline',
          'floors_ag': 4,
          'height': 45,
          'alpha1': .8,
          'alpha2': .75,
          'bid': 2,
          'expected': {
            'slight': 1.11,
            'moderate': 2.23,
            'extensive': 5.57,
            'complete': 13.93
          }
      },
      '3': {
          'mbt': 'C2',
          'sdl': 'pre',
          'perf_rating': 'poor',
          'floors_ag': 4,
          'height': 45,
          'alpha1': .8,
          'alpha2': .75,
          'bid': 2,
          'expected': {
            'slight': .84,
            'moderate': 1.67,
            'extensive': 2.44,
            'complete': 5.14
          }
      }
    }

    for name, test in validation.iteritems():
        d_states = get_damage_states(test)

        for state in d_states.keys():
            diff = abs(d_states[state] - test['expected'][state]) / test['expected'][state]
            if diff > .01:
                print '{}: {} off by {}... expected {}, got {} \n\n{}\n'.format(name, state, diff, test['expected'][state], d_states[state], test)

if __name__ == '__main__':
    capacity = get_capacity('PC1', 'high', 7, 'very_poor', 'poor', 24, 2, 1990)
    capacity, demand, lower_demand, upper_demand, med_intersections, lower_intersections, upper_intersections = aebm.run(capacity, hazard, hazard_beta, pref_periods, mag, rRup)

    plt.figure()
    plt.plot([p['disp'] for p in demand],
        [p['y'] for p in demand], '-ro', label='Calculated Curve')
    plt.plot([p['disp'] for p in upper_demand],
        [p['y'] for p in upper_demand], label='Upper bound demand')
    plt.plot([p['disp'] for p in lower_demand],
        [p['y'] for p in lower_demand], label='Lower bound demand')
    plt.plot([p['x'] for p in capacity['curve']],
        [p['y'] for p in capacity['curve']], 'b', label='Capacity Curve')
    plt.plot([p['disp'] for p in check],
        [p['y'] for p in check], '-go', label='Validation')


    intersections = med_intersections + lower_intersections + upper_intersections
    # intersections
    plt.plot([p['x'] for p in intersections],
        [p['y'] for p in intersections], 'yo', label='Intersections')

    plt.xlim(xmax=demand[-1]['x'] * 2)
    plt.title('Performance Point')
    plt.xlabel('Spectral Displacement')
    plt.ylabel('Spectral Acceleration')
    plt.legend()
    plt.show()

    plt.figure()
    plt.title('Capacity Check')
    plt.xlabel('Spectral Displacement')
    plt.ylabel('Spectral Acceleration')
    plt.plot([p['x'] for p in capacity['curve']],
    [p['y'] for p in capacity['curve']], 'b', label='Computed Capacity Curve')
    plt.plot(capacity_x, capacity_y, 'r', label='Capacity Curve Check')

    plt.xlim(0,10)
    plt.legend()
    plt.show()

    plt.figure()
    acc_difs = []
    for dem in demand:
        for c in check:
            if isclose(c['x'], dem['x']):
                acc_difs += [{'x': dem['x'], 'y': abs(c['y'] - dem['y'])/c['y']}]
                break

    plt.plot([p['x'] for p in acc_difs], [p['y'] * 100 for p in acc_difs], 'o')

    plt.plot([p['x'] for p in demand],
        [p['y'] for p in demand], '-ro', label='Calculated Curve')

    plt.plot([p['x'] for p in check],
        [p['y'] for p in check], '-go', label='Validation')
    
    plt.title('Acceleration Check')
    plt.xlabel('Period (s)')
    plt.ylabel('% Difference')
    plt.show()

    plt.figure()
    disp_difs = []
    acc_difs = []
    for dem in demand:
        for c in check:
            if isclose(c['x'], dem['x']):
                diff = abs(c['disp'] - dem['disp'])
                ratio = 0 if diff < .001 else diff / c['disp']

                disp_difs += [{'x': dem['x'], 'y': ratio}]
                break
  
    plt.plot([p['x'] for p in disp_difs][1:], [p['y'] * 100 for p in disp_difs][1:], 'o')


    plt.plot([p['x'] for p in demand],
        [p['y'] for p in demand], '-ro', label='Calculated Curve')

    plt.plot([p['x'] for p in check],
        [p['y'] for p in check], '-go', label='Validation')
    
    plt.title('Displacement Check')
    plt.xlabel('Period (s)')
    plt.ylabel('% Difference')
    plt.show()