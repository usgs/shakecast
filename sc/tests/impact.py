import unittest
from sc.app.impact import *

class TestImpactInterface(unittest.TestCase):
    def test_acts_like_dictionary(self):
        ii = ImpactInterface()
        ii['test'] = 'test'

        self.assertEquals(ii['test'], 'test')
