import os
import unittest

from shakecast.app.productdownload import *
from shakecast.app.orm import dbconnect, ShakeMap
from shakecast.app.util import get_test_dir

from .basetest import BaseTest

class TestProductGrabber(unittest.TestCase):
    '''
    Test functions for the ProductGrabber class
    '''
    def test_initProductGrabber(self):
        '''
        Test product grabber initialization
        Fails when there is an error in the code
        '''
        pg = ProductGrabber()
        
    def test_getJSONFeed(self):
        '''
        Tests access to the USGS JSON feed. Failure points to error in
        code, lack of internet access, or a down USGS server
        '''
        pg = ProductGrabber()
        pg.get_json_feed()
        
        self.assertNotEqual(pg.json_feed, '')

    def test_geoJSON(self):
        result = geo_json('hour')
        self.assertEqual(result['error'], '')

class TestScenarioDownload(unittest.TestCase):
    def test_downloadBadScenario(self):
        result = download_scenario('not_a_real_scenario')
        self.assertEqual('failed', result['status'])

    def test_downloadActualScenario(self):
        result = download_scenario('bssc2014903_m6p09_se', scenario=True)
        self.assertEqual('finished', result['status'])

    @dbconnect
    def test_doubleDownload(self, session=None):
        result = download_scenario('bssc2014903_m6p09_se', scenario=True)
        self.assertEqual('finished', result['status'])
        result = download_scenario('bssc2014903_m6p09_se', scenario=True)
        self.assertEqual('finished', result['status'])

        shakemaps = session.query(ShakeMap).filter(ShakeMap.shakemap_id == 'bssc2014903_m6p09_se_scenario').all()

        self.assertTrue(len(shakemaps) == 1)



class TestImportFromDirectory(unittest.TestCase):

    @dbconnect
    def test_imports(self, session=None):
        scenario_directory = os.path.join(get_test_dir(), 'data', 'new_event', 'new_event-1')
        event, shakemap = grab_from_directory(scenario_directory, session=session)

        shakemap_from_db = session.query(ShakeMap).filter(ShakeMap.shakemap_id == event.event_id).first()
        self.assertIsNotNone(shakemap_from_db)


class TestImportUpdatedEvent(BaseTest):

    @dbconnect
    def test_importFirst(self, session=None):
        json_file = os.path.join(get_test_dir(), 'data', 'geojson', 'first.json')

        pg = ProductGrabber()
        with open(json_file, 'r') as json_file_:
            pg.json_feed = json.loads(json_file_.read())

        pg.read_json_feed()
        pg.get_new_events()

        event = session.query(Event).filter(Event.event_id == 'us6000bdgz').first()
        self.assertIsNotNone(event)

    @dbconnect
    def test_importUpdated(self, session=None):
        json_file = os.path.join(get_test_dir(), 'data', 'geojson', 'first.json')

        pg = ProductGrabber()
        with open(json_file, 'r') as json_file_:
            pg.json_feed = json.loads(json_file_.read())

        pg.read_json_feed()
        pg.get_new_events()

        event = session.query(Event).filter(Event.event_id == 'us6000bdgz').first()
        self.assertIsNotNone(event)

        pg = ProductGrabber()
        json_file = os.path.join(get_test_dir(), 'data', 'geojson', 'updated.json')
        with open(json_file, 'r') as json_file_:
          pg.json_feed = json.loads(json_file_.read())

        pg.read_json_feed()
        pg.get_new_events()

        event = session.query(Event).filter(Event.event_id == 'NEW_ID').first()

        self.assertIsNotNone(event)

if __name__ == '__main__':
    unittest.main()