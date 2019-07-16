import os
import unittest

from shakecast.app.productdownload import grab_from_directory
from shakecast.app.orm import dbconnect, ShakeMap, Group
from shakecast.app.products.sc_csv import main
from shakecast.app.util import get_test_dir

class TestCSVGeneration(unittest.TestCase):

    @dbconnect
    def test_imports(self, session=None):
        scenario_directory = os.path.join(get_test_dir(), 'data', 'new_event', 'new_event-1')
        event, shakemap = grab_from_directory(scenario_directory, session=session)

        group = Group(
            name='TESTGROUP'
        )

        csv_name = 'test_csv'
        csv_result = main(group, shakemap, name=csv_name)

        path = os.path.join(shakemap.local_products_dir, csv_name)
        self.assertTrue(os.path.exists(path))

if __name__ == '__main__':
    unittest.main()
