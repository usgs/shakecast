import os
from sqlalchemy import MetaData
import unittest

from shakecast.app.eventprocessing import *
from shakecast.app.functions import download_scenario
from shakecast.app.grid import create_grid
from shakecast.app.orm import (
    dbconnect,
    engine,
    Event,
    ShakeMap
)
from shakecast.app.productdownload import grab_from_directory
from shakecast.app.util import get_test_dir

from .util import create_group, create_new_event, create_fac, preload_data

class TestScenarioRun(unittest.TestCase):
    def test_badScenario(self):
        result = run_scenario('a_bad_Event_id')
        self.assertFalse(result['message']['success'])

    @dbconnect
    def test_scenarioRun(self, session=None):
        # import from directory
        scenario_directory = os.path.join(get_test_dir(), 'data', 'new_event', 'new_event-1')
        event, shakemap = grab_from_directory(scenario_directory, session=session)

        result = run_scenario(shakemap.shakemap_id)
        self.assertTrue(result['message']['success'])


class TestUtf8(unittest.TestCase):
    def test_Utf8Download(self):
      download_scenario('us7000df40')
      result = run_scenario('us7000df40_scenario')

      self.assertTrue(result['message']['success'])


class TestNewEvent(unittest.TestCase):
    @dbconnect
    def test_processNewEvent(self, session=None):
        preload_data()
        new_event = session.query(Event).first()
        processed_events = process_events([new_event], session)

        if new_event is None:
            return None

        for event in processed_events:
            self.assertNotEqual(event.status, 'new')
        
        self.assertIsNotNone(new_event.geojson)

    @dbconnect
    def test_heartbeat(self, session=None):
        new_event = create_new_event(type='HEARTBEAT')
        group1 = create_group(name='gets_heartbeat', heartbeat=True)
        group2 = create_group(name='no_heartbeat', heartbeat=False)
        session.add(group1)
        session.add(group2)
        session.commit()

        processed_events = process_events([new_event], session)
        notifications = processed_events[0].notifications
        group_names = [notification.group.name for notification in notifications]

        self.assertTrue('gets_heartbeat' in group_names)
        self.assertTrue('no_heartbeat' not in group_names)

class TestNewShakemap(unittest.TestCase):
    @dbconnect
    def test_process_Shakemap(self, session=None):
        preload_data()
        shakemap = session.query(ShakeMap).first()

        processed_shakemaps = process_shakemaps([shakemap], session)

        for shakemap in processed_shakemaps:
            self.assertNotEqual(shakemap.status, 'new')
        
        self.assertIsNotNone(shakemap.geojson)

    @dbconnect
    def test_process_NoProducts(self, session=None):
        preload_data()
        g = session.query(Group).first()
        g.product_string = None
        session.commit()

        shakemap = session.query(ShakeMap).first()
        processed_shakemaps = process_shakemaps([shakemap], session=session)
        for shakemap in processed_shakemaps:
            self.assertNotEqual(shakemap.status, 'new')

        
if __name__ == '__main__':
    unittest.main()
