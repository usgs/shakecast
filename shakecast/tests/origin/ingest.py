import os
import unittest

from shakecast.app.origin.ingest import *
from shakecast.app.util import get_test_dir

ORIGIN_DIR = os.path.join(get_test_dir(), 'data', 'origin')

class TestOrigin(unittest.TestCase):
    def testOriginIngest(self):
        origin = get_origin_from_directory(ORIGIN_DIR)
        event = transform_origin_to_event(origin)

        should_import = assess_event(event)
        self.assertFalse(should_import)

if __name__ == '__main__':
    unittest.main()