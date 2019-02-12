import unittest

from shakecast.app.eventprocessing import *

class TestScenarioDownload(unittest.TestCase):
    def test_badScenario(self):
        result = run_scenario('a_bad_Event_id')
        self.assertFalse(result['message']['success'])