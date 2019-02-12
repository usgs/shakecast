import json
import unittest

from shakecast.app.jsonencoders import *
from shakecast.app.orm import Base, User

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

