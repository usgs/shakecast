import unittest
from shakecast.app.impact import *
from shakecast.app.grid import ShakeMapGrid, Point
from shakecast.app.orm import Aebm, Event, ShakeMap

from .util import create_fac

class TestImpactInterface(unittest.TestCase):
    def test_acts_like_dictionary(self):
        ii = ImpactInterface()
        ii['test'] = 'test'

        self.assertEquals(ii['test'], 'test')

class TestComputeAebmImpact(unittest.TestCase):
    def test_computesAebm(self):
        event = Event(
            event_id='test_event',
            magnitude=6.09,
            lat=100,
            lon=100
        )
        shakemap = ShakeMap(
            shakemap_id='test_event',
            lat_min=95,
            lat_max=105,
            lon_min=95,
            lon_max=105,
            shakecast_id=5000,
            event=event
        )
        grid = ShakeMapGrid(
            lat_min=95,
            lat_max=105,
            lon_min=95,
            lon_max=105,
        )
        point = Point()
        point.update({
            'PGA': 1.76,
            'LON': 102,
            'PSA03': 5.55,
            'PGV': 2.0,
            'MMI': 4.02,
            'PSA10': 2.71,
            'LAT': 102,
            'PSA30': 0.61
        })
        aebm = Aebm(
            mbt='C2',
            sdl='high',
            bid=1,
            height=24,
            stories=2,
            year=1982
        )

        facility = create_fac(grid)
        facility.aebm = aebm

        result = compute_aebm_impact(facility, point, shakemap)
        self.assertIsNotNone(result['alert_level'])
        

if __name__ == '__main__':
    unittest.main()