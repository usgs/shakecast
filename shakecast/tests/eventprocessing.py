import unittest

from shakecast.app.eventprocessing import *
from shakecast.app.orm import Event, ShakeMap

class TestScenarioDownload(unittest.TestCase):
    def test_badScenario(self):
        result = run_scenario('a_bad_Event_id')
        self.assertFalse(result['message']['success'])

class TestNewEvent(unittest.TestCase):
    new_event = Event(
        status = 'new',
        magnitude = 10,
        type='heartbeat',
        
    )