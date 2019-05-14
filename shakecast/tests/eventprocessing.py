import time
import unittest

from shakecast.app.eventprocessing import *
from shakecast.app.orm import (
    dbconnect,
    engine,
    Event,
    metadata,
    ShakeMap
)

class TestScenarioDownload(unittest.TestCase):
    def test_badScenario(self):
        result = run_scenario('a_bad_Event_id')
        self.assertFalse(result['message']['success'])

class TestNewEvent(unittest.TestCase):
    def setup(self):
        metadata.drop_all()
        metadata.create_all(engine)

    @dbconnect
    def test_processNewEvent(self, session=None):
        new_event = create_new_event()
        processed_events = process_events([new_event], session)

        for event in processed_events:
            self.assertNotEqual(event.status, 'new')

def create_new_event(**kwargs):
    defaults = {
        'shakecast_id': 1,
        'event_id': 'new_event',
        'status': 'new',
        'type': 'test',
        'all_event_ids': ',new_event,',
        'lat': 40,
        'lon': -120,
        'depth': 10,
        'magnitude': 6,
        'title': 'Test event',
        'place': 'Test event in Western US',
        'time': time.time()
    }
    defaults.update(kwargs)

    return Event(**defaults)