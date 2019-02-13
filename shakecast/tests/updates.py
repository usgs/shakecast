import os
import unittest

from shakecast.app.updates import SoftwareUpdater, check_for_updates
from shakecast.app.util import sc_dir

class TestUpdates(unittest.TestCase):
    def test_NewUpdate(self):
        s = SoftwareUpdater()
        new = s.check_new_update('1.1.1', '1.0.1')
        self.assertTrue(new)
        new = s.check_new_update('1.1.2', '1.1.1')
        self.assertTrue(new)
        new = s.check_new_update('2.0.0', '1.1.1')
        self.assertTrue(new)
        new = s.check_new_update('1.1.1', '1.1.1')
        self.assertFalse(new)
        new = s.check_new_update('1.1.1b2', '1.1.1b1')
        self.assertTrue(new)
        new = s.check_new_update('1.1.1b2', '1.1.1b2')
        self.assertFalse(new)
        new = s.check_new_update('1.1.2b0', '1.1.1b2')
        self.assertTrue(new)
        new = s.check_new_update('1.1.2b2', '1.1.1b2')
        self.assertTrue(new)
        new = s.check_new_update('1.1.2b3', '1.1.1b2')
        self.assertTrue(new)
        new = s.check_new_update('1.1.1rc2', '1.1.1rc1')
        self.assertTrue(new)
        new = s.check_new_update('1.1.1rc2', '1.1.1rc2')
        self.assertFalse(new)
        new = s.check_new_update('1.1.2rc0', '1.1.1rc2')
        self.assertTrue(new)
        new = s.check_new_update('1.1.2rc2', '1.1.1rc2')
        self.assertTrue(new)
        new = s.check_new_update('1.1.2rc3', '1.1.1rc2')
        self.assertTrue(new)
        new = s.check_new_update('1.1.2', '1.1.1rc2')
        self.assertTrue(new)
        new = s.check_new_update('1.1.2rc1', '1.1.1')
        self.assertFalse(new)
        new = s.check_new_update('1.1.2b5', '1.1.2rc1')
        self.assertFalse(new)
        new = s.check_new_update('1.1.2rc1', '1.1.2b5')
        self.assertTrue(new)

    def test_CheckUpdate(self):
        s = SoftwareUpdater()
        s.json_url = os.path.normpath(os.sep.join(['file://', 
                                                    sc_dir(), 
                                                    'tests',
                                                    'data',
                                                    'update_test.json']))
        s.check_update(testing=True)
    
    def test_Update(self):
        s = SoftwareUpdater()
        s.json_url = os.path.normpath(os.sep.join(['file://', 
                                                    sc_dir(), 
                                                    'tests',
                                                    'data',
                                                    'update_test.json']))
        s.update(testing=True)

    def test_NotifyAdmin(self):
        s = SoftwareUpdater()
        s.notify_admin()

    def test_UpdateFunction(self):
        check_for_updates()
