import damping
from spectrum import build_spectrum
from demand import get_demand
from damage import get_damage_state_beta
from performance_point import performance_point

def run(capacity, hazard, hazard_beta, pref_periods, mag, rRup):
    demand, lower_demand, upper_demand = get_demand(hazard, hazard_beta, pref_periods, capacity, mag, rRup)
    med_intersections = performance_point(capacity['curve'], demand)
    lower_intersections = performance_point(capacity['curve'], lower_demand)
    upper_intersections = performance_point(capacity['curve'], upper_demand)

    capacity['calcucated_beta'] = get_damage_state_beta(capacity['default_damage_state_beta'], capacity['damage_state_medians']['complete'], lower_intersections[0]['x'], lower_intersections[0]['y'], upper_intersections[0]['x'], upper_intersections[0]['y'], hazard_beta, capacity['quality_rating'], capacity['performance_rating'], capacity['year'], capacity['stories'])

    return capacity, demand, lower_demand, upper_demand, med_intersections, lower_intersections, upper_intersections

