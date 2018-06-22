import damping
from spectrum import build_spectrum

def make_demand_spectrum(input):
    return [
      {
        'disp': point['y'] * point['x']**2 * 9.779738,
        'y': point['y'],
        'x': point['x']
      } for point in input
    ]

def run(input, pref, capacity, mag, rRup):
    output = build_spectrum(input, pref, insert=[capacity['t_e'], capacity['t_u']], finish_val=0)
    demand = make_demand_spectrum(output)
    damped_demand = damping.damp(demand, capacity, mag, rRup)

    return damped_demand