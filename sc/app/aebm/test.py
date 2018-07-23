import unittest
from damage import *
from capacity import *
from damping import get_kappa

class TestDamageStates(unittest.TestCase):
    def test_validate(self):
        # validation
        validation = {
          '1': {
              'mbt': 'C2',
              'sdl': 'pre',
              'perf_rating': 'baseline',
              'floors_ag': 4,
              'height': 45,
              'modal_height': .8,
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
              'bid': 3,
              'expected': {
                'slight': .84,
                'moderate': 1.67,
                'extensive': 2.44,
                'complete': 5.14
              }
          },
          '4': {
              'mbt': 'C2',
              'sdl': 'pre',
              'perf_rating': 'poor',
              'floors_ag': 4,
              'height': 45,
              'alpha1': .8,
              'alpha2': .75,
              'bid': 4,
              'expected': {
                'slight': .84,
                'moderate': 1.67,
                'extensive': 1.97,
                'complete': 3.72
              }
          },
          '5': {
              'mbt': 'C2',
              'sdl': 'pre',
              'perf_rating': 'poor',
              'floors_ag': 4,
              'height': 45,
              'alpha1': .8,
              'alpha2': .75,
              'bid': 5,
              'expected': {
                'slight': .84,
                'moderate': 1.67,
                'extensive': 2.44,
                'complete': 5.14
              }
          },
          '6': {
              'mbt': 'C2',
              'sdl': 'pre',
              'perf_rating': 'very_poor',
              'floors_ag': 4,
              'height': 45,
              'alpha1': .8,
              'alpha2': .75,
              'bid': 6,
              'expected': {
                'slight': .84,
                'moderate': 1.67,
                'extensive': 2.05,
                'complete': 3.24
              }
          },
          '7': {
              'mbt': 'C2',
              'sdl': 'pre',
              'perf_rating': 'very_poor',
              'floors_ag': 4,
              'height': 45,
              'alpha1': .8,
              'alpha2': .75,
              'bid': 7,
              'expected': {
                'slight': .84,
                'moderate': 1.67,
                'extensive': 2.05,
                'complete': 3.24
              }
          },
          '8': {
              'mbt': 'PC1',
              'sdl': 'high',
              'perf_rating': 'baseline',
              'floors_ag': 2,
              'height': 24,
              'alpha1': .8,
              'alpha2': .75,
              'bid': 1,
              'expected': {
                'slight': .72,
                'moderate': 1.43,
                'extensive': 4.30,
                'complete': 12.54
              }
          },
          '9': {
              'mbt': 'PC1',
              'sdl': 'special_high',
              'perf_rating': 'baseline',
              'floors_ag': 2,
              'height': 24,
              'alpha1': .8,
              'alpha2': .75,
              'bid': 2,
              'expected': {
                'slight': .9,
                'moderate': 1.79,
                'extensive': 5.37,
                'complete': 15.67
              }
          },
          '10': {
              'mbt': 'PC1',
              'sdl': 'moderate',
              'perf_rating': 'poor',
              'floors_ag': 2,
              'height': 24,
              'alpha1': .8,
              'alpha2': .75,
              'bid': 3,
              'expected': {
                'slight': .72,
                'moderate': 1.07,
                'extensive': 2.45,
                'complete': 5.88
              }
          },
          '11': {
              'mbt': 'W1',
              'sdl': 'high',
              'perf_rating': 'baseline',
              'floors_ag': 1,
              'height': 14,
              'alpha1': .8,
              'alpha2': .75,
              'bid': 2,
              'expected': {
                'slight': .5,
                'moderate': 1.51,
                'extensive': 5.04,
                'complete': 12.6
              }
          },
          '12': {
              'mbt': 'W1',
              'sdl': 'moderate',
              'perf_rating': 'poor',
              'floors_ag': 1,
              'height': 14,
              'alpha1': .8,
              'alpha2': .75,
              'bid': 3,
              'expected': {
                'slight': .5,
                'moderate': 1.26,
                'extensive': 3.15,
                'complete': 7.56
              }
          },
          '13': {
              'mbt': 'W1',
              'sdl': 'high',
              'perf_rating': 'baseline',
              'floors_ag': 2,
              'height': 24,
              'alpha1': .8,
              'alpha2': .75,
              'bid': 2,
              'expected': {
                'slight': .72,
                'moderate': 2.15,
                'extensive': 6.12,
                'complete': 13.35
              }
          },
          '14': {
              'mbt': 'W1',
              'sdl': 'moderate',
              'perf_rating': 'poor',
              'floors_ag': 2,
              'height': 24,
              'alpha1': .8,
              'alpha2': .75,
              'bid': 3,
              'expected': {
                'slight': .72,
                'moderate': 1.79,
                'extensive': 3.83,
                'complete': 8.01
              }
          },
          '15': {
              'mbt': 'C2',
              'sdl': 'moderate',
              'perf_rating': 'baseline',
              'floors_ag': 1,
              'height': 12,
              'alpha1': .8,
              'alpha2': .75,
              'bid': 1,
              'expected': {
                'slight': .43,
                'moderate': .86,
                'extensive': 2.48,
                'complete': 6.48
              }
          },
          '16': {
              'mbt': 'C2',
              'sdl': 'moderate',
              'perf_rating': 'baseline',
              'floors_ag': 5,
              'height': 50,
              'alpha1': .8,
              'alpha2': .75,
              'bid': 1,
              'expected': {
                'slight': 1.17,
                'moderate': 2.33,
                'extensive': 6.7,
                'complete': 17.48
              }
          }
        }

        # error = ''
        # for name, test in validation.iteritems():
        #     d_states = get_damage_state_medians(test['mbt'], test['sdl'], test['performance_rating'], test['height'], test['modal_height'], test['modal_response'])

        #     for state in d_states.keys():
        #         diff = abs(d_states[state] - test['expected'][state]) / test['expected'][state]
        #         if diff > .01:
        #             error += '\n{}: {} off by {}... expected {}, got {} \n--------------------------\n{}\n'.format(
        #               name,
        #               state,
        #               diff,
        #               test['expected'][state],
        #               d_states[state],
        #               test
        #             )

        # if error:
        #     raise Exception(error)

class TestKappa(unittest.TestCase):
    def test_validate(self):
        kappa = get_kappa('baseline', 1971, 6.5, 20)
        self.assertAlmostEqual(kappa, .6)

        kappa = get_kappa('poor', 1961, 6.5, 20)
        self.assertAlmostEqual(kappa, .4)

        kappa = get_kappa('baseline', 1990, 7.9, 11.2)
        self.assertAlmostEqual(kappa, .7)

        kappa = get_kappa('very_poor', 1990, 7.9, 11.2)
        self.assertAlmostEqual(kappa, .5)


        kappa = get_kappa('very_poor', 1955, 7.9, 11.2)
        self.assertAlmostEqual(kappa, .3)


        kappa = get_kappa('very_poor', 1940, 7.9, 11.2)
        self.assertAlmostEqual(kappa, .2)

if __name__ == '__main__':
    unittest.main()