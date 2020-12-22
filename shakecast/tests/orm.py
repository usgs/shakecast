import unittest

from shakecast.app.orm import *
from shakecast.app.orm.data import load_data


class TestShakeMap(unittest.TestCase):
    def test100Red(self):
        sm = ShakeMap()
        fs = FacilityShaking(
            shakemap = sm,
            weight = 5,
            gray = 0,
            green = 0,
            yellow = 0,
            orange = 0,
            red = 100,
            alert_level = 'red'
        )

        alert_level = sm.get_alert_level()
        self.assertEqual(alert_level, 'red')
    
    @dbconnect
    def test_getProduct(self, session=None):
        load_data(session)
        
        sm = ShakeMap()
        lpt = session.query(LocalProductType).first()
        p = LocalProduct(
            product_type = lpt,
            shakemap=sm
        )

        p = sm.get_local_product(lpt.name)
        self.assertIsNotNone(p)

    def test_getProductNone(self):
        sm = ShakeMap()
        p = sm.get_local_product('DOES_NOT_EXIST')

        self.assertIsNone(p)


class TestFacilityShaking(unittest.TestCase):
    def test_impactRankNoMetric(self):
        fs = FacilityShaking(
            facility=Facility()
        )

        fs.impact_rank

    def test_impactRankNoThreshold(self):
        fs = FacilityShaking(
            facility=Facility(),
            metric='MMI'
        )

        fs.impact_rank


if __name__ == '__main__':
    unittest.main()
