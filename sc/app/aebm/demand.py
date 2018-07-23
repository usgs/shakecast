from spectrum import build_spectrum
import damping

import math

def make_demand_spectrum(input):
    for point in input:
        disp = point['y'] * point['x']**2 * 9.779738
        acc = disp/(9.779738 * (point['x']**2))
        point['disp'] = disp
        point['y'] = acc

    return input

def get_demand(hazard, hazard_beta, pref_periods, capacity, mag, rRup):
    output = build_spectrum(hazard, pref_periods, insert=[capacity['elastic_period'], capacity['ultimate_period']], finish_val=0)
    demand = make_demand_spectrum(output)
    damped_demand = damping.damp(demand, capacity, mag, rRup)

    upper_bound_demand = []
    lower_bound_demand = []
    for point in damped_demand:
        lower_bound_demand += [
            {
                'disp': point['disp'] / math.exp(hazard_beta),
                'y': point['y'] / math.exp(hazard_beta)
            }
        ]
        upper_bound_demand += [
            {
                'disp': point['disp'] * math.exp(hazard_beta),
                'y': point['y'] * math.exp(hazard_beta)
            }
        ]

    return damped_demand, lower_bound_demand, upper_bound_demand
