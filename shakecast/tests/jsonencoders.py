import json
import unittest

from shakecast.app.jsonencoders import *
from shakecast.app.orm import Base, User, Group, Facility, FacilityShaking, sql_to_obj

class TestSqlAlchemyToObj(unittest.TestCase):
    '''
    SQLAlchemy to object encoder
    '''

    def test_convertsToObject(self):
        u = User()
        converted = sql_to_obj(u)

        self.assertFalse(isinstance(converted, Base))

    def test_convertsSqlAList(self):
        u1 = User(
            username = 'u1'
        )
        u2 = User(
            username = 'u2'
        )

        converted = sql_to_obj([u1, u2])

        for user in converted:
            self.assertFalse(isinstance(user, Base))

        self.assertEqual(converted[0]['username'], 'u1')
        self.assertEqual(converted[1]['username'], 'u2')

    def test_convertsSqlADict(self):
        u1 = User()
        u2 = User()

        converted = sql_to_obj({
            'user1': u1,
            'user2': u2
        })

        self.assertFalse(isinstance(converted['user1'], Base))
        self.assertFalse(isinstance(converted['user2'], Base))

class TestAlchemyEncoder(unittest.TestCase):

    def test_AlchemyEncoder(self):
        '''
        Runs through a default use case of the Alchemy Encoder
        '''
        user = User()
        user.username = 'TEST'
        user_json = json.dumps(user, cls=AlchemyEncoder)

        user_dict = json.loads(user_json)
        self.assertTrue(user_dict['username'] == 'TEST')

class TestGeoJson(unittest.TestCase):

    def test_geoJsonPreloads(self):
        geo = GeoJson()
        self.assertTrue(geo.get('type', False))
        self.assertTrue(geo.get('geometry', False))
        self.assertEqual(geo['properties'], {})

    def test_geoJsonFacility(self):
        f = Facility(
            lat_max = 80,
            lat_min = 79,
            lon_max = 100,
            lon_min = 99,
            name = 'TEST'
        )

        fs = FacilityShaking(
            facility=f
        )

        geojson = fs.geojson

        self.assertEqual(geojson['geometry']['type'], 'Point')
        self.assertEqual(geojson['geometry']['coordinates'][0], f.lon)
        self.assertEqual(geojson['geometry']['coordinates'][1], f.lat)

    def test_geoJsonSetsProperties(self):
        f = Facility(
            lat_max = 80,
            lat_min = 79,
            lon_max = 100,
            lon_min = 99,
            name = 'TEST'
        )
    
        fs = FacilityShaking(
            facility=f
        )

        geojson = fs.geojson

        self.assertEqual(geojson['properties']['name'], f.name)


if __name__ == '__main__':
    unittest.main()