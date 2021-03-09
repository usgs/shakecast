import unittest

from shakecast.app.eventprocessing import process_shakemaps
from shakecast.app.productgeneration import create_products
from shakecast.app.orm import (
    dbconnect,
    ShakeMap
)
from shakecast.app.productdownload import grab_from_directory
from shakecast.app.util import get_test_dir

from .util import create_group, create_new_event, create_fac, preload_data


class TestProductGeneration(unittest.TestCase):
    @dbconnect
    def test_process_Shakemap(self, session=None):
        preload_data()
        shakemap = session.query(ShakeMap).first()

        shakemap = process_shakemaps([shakemap], session)[0]
        notification = create_products(session=session)

        self.assertEqual(notification.status, 'ready')
        for product in shakemap.local_products:
          self.assertIsNone(product.error)


if __name__ == '__main__':
    unittest.main()