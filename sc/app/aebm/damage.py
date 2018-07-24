from data_tables import interstory_drift, default_beta
import math

def get_drift(mbt, sdl, perf, state):
    return interstory_drift['{}_{}'.format(sdl, perf)][mbt][state]

def get_damage_state_medians(mbt, sdl, performance_rating, height, modal_height, modal_response):
    states = {
      'slight': 0,
      'moderate': 0,
      'extensive': 0,
      'complete': 0
    }

    damage_state_medians = {}
    for state in states.keys():
        drift = get_drift(
            mbt,
            sdl,
            performance_rating,
            state
        )

        modal_response_ = modal_response[state]

        states[state] = (
            drift * height * 12 * (modal_height / modal_response_)
        )

    return states

def get_default_damage_state_beta(quality_rating, performance_rating, year, stories):

    if year > 1975:
        year_cat = 'post-1975'
    elif year > 1960:
        year_cat = '1960-1975'
    elif year > 1940:
        year_cat = '1941-1960'
    else:
        year_cat = 'pre-1941'

    performance_rating = (
        performance_rating if performance_rating == 'baseline' 
        else 'non-baseline'
    )

    stories = stories if stories <= 15 else 15

    return default_beta[quality_rating][performance_rating][year_cat][stories]
    

def get_damage_state_beta(default_beta, default_median, lower_bound_demand_disp, lower_bound_demand_acc, upper_bound_demand_disp, upper_bound_demand_acc, demand_uncertainty, quality_rating, performance_rating, year, stories):

    '''
        MIN(
            1.1*default_beta,
            MAX(
                0.9*default_beta,
                SQRT(
                    (MIN(
                        MAX(
                            LN(
                                IF(
                                    upper_bound_demand_disp<1.2*default_median,
                                    upper_bound_demand_disp,
                                    1.2*default_median
                                )/
                                IF(lower_bound_demand_disp<1.2*default_median,
                                lower_bound_demand_disp,
                                1.2*default_median)
                            ) / 2
                            ,
                            demand_uncertainty / 2
                        ),
                        2 * demand_uncertainty)
                    )^2
                    +(MIN(
                        MAX(
                            LN(
                                IF(
                                    upper_bound_demand_acc<1.2*default_median,
                                    upper_bound_demand_acc,
                                    1.2*default_median
                                )/
                                IF(
                                    lower_bound_demand_acc<1.2*default_median,
                                    lower_bound_demand_acc,
                                    1.2*default_median
                                )
                            )/2,
                            beta_c/2
                        ),
                        2*beta_c
                    )
                    )^2
                    +
                    beta_t^2)
                )
            )
    '''

    uncertainty_lookup = {
        'best': {
            'baseline': {
                'beta_t': .2,
                'beta_c': .1
            },
            'non-baseline': {
                'beta_t': .4,
                'beta_c': .2
            }
        },
        'very_good': {
            'baseline': {
                'beta_t': .25,
                'beta_c': .15
            },
            'non-baseline': {
                'beta_t': .45,
                'beta_c': .25
            }
        },
        'good': {
            'baseline': {
                'beta_t': .3,
                'beta_c': .2
            },
            'non-baseline': {
                'beta_t': .5,
                'beta_c': .3
            }
        },
        'poor': {
            'baseline': {
                'beta_t': .4,
                'beta_c': .25
            },
            'non-baseline': {
                'beta_t': .55,
                'beta_c': .35
            }
        },
        'very_poor': {
            'baseline': {
                'beta_t': .5,
                'beta_c': .3
            },
            'non-baseline': {
                'beta_t': .6,
                'beta_c': .4
            }
        }
    }

    performance_rating = (
            performance_rating if performance_rating == 'baseline'
            else 'non-baseline'
    )

    beta_c = uncertainty_lookup[quality_rating][performance_rating]['beta_c']
    beta_t = uncertainty_lookup[quality_rating][performance_rating]['beta_t']

    return min(1.1 * default_beta, max(.9 * default_beta, math.sqrt(min(max(math.log(min(upper_bound_demand_disp, 1.2 * default_median) / min(lower_bound_demand_disp, 1.2 * default_median))/2, demand_uncertainty / 2), demand_uncertainty * 2)**2) + min(max(math.log(min(upper_bound_demand_acc, 1.2 * default_median) / min(lower_bound_demand_acc, 1.2 * default_median))/2, beta_c / 2), 2 * beta_c)**2 + beta_t**2))

def get_damage_probabilities(damage_state_medians, damage_state_beta, displacement):
    complete = lognorm(damage_state_medians['complete'], damage_state_beta, displacement)
    extensive = lognorm(damage_state_medians['extensive'], damage_state_beta, displacement) - complete
    moderate = lognorm(damage_state_medians['moderate'], damage_state_beta, displacement) - complete - extensive
    slight = lognorm(damage_state_medians['slight'], damage_state_beta, displacement) - complete - extensive - moderate
    none = 1 - complete - extensive - moderate - slight

    return {
        'complete': complete,
        'extensive': extensive,
        'moderate': moderate,
        'slight': slight,
        'none': none
    }

def lognorm(med, spread, value):
    p_norm = (math.erf((value-med)/(math.sqrt(2) * spread)) + 1)/2
    return p_norm