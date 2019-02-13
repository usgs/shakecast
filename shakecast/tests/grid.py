import copy
import unittest

from shakecast.app.grid import *

class TestPoint(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.point_lst = [
            Point(
                mmi = 0,
                pga = 2
            ),
            Point(
                mmi = 2,
                pga = 0
            )
        ]

    def test_SortBy(self):
        point_lst = self.get_point_lst()

        Point.sort_by = 'mmi'
        point_lst.sort()
        self.assertTrue(point_lst[1]['mmi'] > point_lst[0]['mmi'])

        Point.sort_by = 'pga'
        point_lst.sort()
        self.assertTrue(point_lst[1]['pga'] > point_lst[0]['pga'])
    
    def get_point_lst(self):
        return copy.copy(self.point_lst)

if __name__ == '__main__':
    unittest.main()
