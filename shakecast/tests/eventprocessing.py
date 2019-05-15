from sqlalchemy import MetaData
import unittest

from shakecast.app.eventprocessing import *
from shakecast.app.orm import (
    clear_data,
    dbconnect,
    engine,
    Event,
    ShakeMap
)

from .util import create_new_event, create_group, create_new_shakemap

class TestScenarioRun(unittest.TestCase):
    def test_badScenario(self):
        result = run_scenario('a_bad_Event_id')
        self.assertFalse(result['message']['success'])


class TestNewEvent(unittest.TestCase):
    @dbconnect
    def test_processNewEvent(self, session=None):
        new_event = create_new_event()
        processed_events = process_events([new_event], session)

        for event in processed_events:
            self.assertNotEqual(event.status, 'new')

    @dbconnect
    def test_processNewEventWithGroup(self, session=None):
        new_event = create_new_event(type='ACTUAL')
        group = create_group()
        session.add(group)

        session.commit()
        processed_events = process_events([new_event], session)

        for event in processed_events:
            self.assertNotEqual(event.status, 'new')

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
        new_event = create_new_event()
        shakemap = create_new_shakemap()
        shakemap.event = new_event

        processed_shakemaps = process_shakemaps([shakemap], session)
        for shakemap in processed_shakemaps:
            self.assertNotEqual(shakemap.status, 'new')
