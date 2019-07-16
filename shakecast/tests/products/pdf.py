import os
import unittest

from shakecast.app.productdownload import grab_from_directory
from shakecast.app.orm import dbconnect, ShakeMap, Group
from shakecast.app.products.pdf import main
from shakecast.app.util import get_test_dir

class TestPDFGeneration(unittest.TestCase):

    @dbconnect
    def test_pdfGeneration(self, session=None):
        scenario_directory = os.path.join(get_test_dir(), 'data', 'new_event', 'new_event-1')
        event, shakemap = grab_from_directory(scenario_directory, session=session)

        group = Group(
            name='TESTGROUP'
        )

        pdf_name = 'test_pdf'
        pdf_result = main(group, shakemap, name=pdf_name)

        path = os.path.join(shakemap.local_products_dir, pdf_name)
        self.assertTrue(os.path.exists(path))

if __name__ == '__main__':
    unittest.main()
