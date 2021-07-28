import os
import unittest

from shakecast.app.shakemap.ingest import *
from shakecast.app.util import get_test_dir

SHAKEMAP_DIR = os.path.join(get_test_dir(), 'data', 'shakemap')

class TestOrigin(unittest.TestCase):
    def testOriginIngest(self):
        info = get_info_from_directory(SHAKEMAP_DIR)
        shakemap = transform_info_to_shakemap(info)


if __name__ == '__main__':
    unittest.main()