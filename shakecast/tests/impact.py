import unittest
from shakecast.app.impact import *
from shakecast.app.grid import ShakeMapGrid, Point
from shakecast.app.orm import Aebm, Event, Facility, FacilityShaking, Group, ShakeMap

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

class TestEventImpact(unittest.TestCase):
    def test_event_impact(self):
        facility_shaking = [
            FacilityShaking(alert_level = 'green')
        ]

        impact = get_event_impact(facility_shaking)
        self.assertTrue(impact['green'] == 1)

    def test_group_impact(self):
        facility = Facility()
        group = Group(
            facilities = [facility]
        )

        facility_shaking = [
            FacilityShaking(
                alert_level = 'green',
                facility = facility
            )
        ]


        shakemap = ShakeMap(
            facility_shaking = facility_shaking
        )

        impact = shakemap.get_impact_summary(group)
        
        self.assertTrue(impact['green'] == 1)

    def test_multiple_group_impact(self):
        facility1 = Facility()
        facility2 = Facility()

        group1 = Group(
            facilities = [facility1]
        )
        group2 = Group(
            facilities = [facility2]
        )

        facility_shaking = [
            FacilityShaking(
                alert_level = 'green',
                facility = facility1
            ),
            FacilityShaking(
                alert_level = 'red',
                facility = facility2
            )
        ]

        shakemap = ShakeMap(
            facility_shaking = facility_shaking
        )

        impact = shakemap.get_impact_summary()
        self.assertTrue(impact['green'] == 1)
        self.assertTrue(impact['red'] == 1)

        impact = shakemap.get_impact_summary(group1)
        self.assertTrue(impact['green'] == 1)
        self.assertTrue(impact['red'] == 0)

        impact = shakemap.get_impact_summary(group2)
        self.assertTrue(impact['green'] == 0)
        self.assertTrue(impact['red'] == 1)


        

if __name__ == '__main__':
    unittest.main()