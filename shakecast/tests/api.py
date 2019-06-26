import json
import unittest
from shakecast.web_server import app

class TestOpenAPI(unittest.TestCase):
    def setUp(self):
        self.app = app.test_client()
        login(self.app, 'scadmin', 'scadmin')

    def test_root(self):
        response = self.app.get('/', follow_redirects=True)
        self.assertEqual(response.status_code, 200)

    def test_earthquake_data(self):

        response = self.app.get('/api/earthquake-data')
        self.assertEqual(response.status_code, 200)
        self.assertTrue(is_json(response.data))

    def test_group_data(self):
        response = self.app.get('/api/groups')
        self.assertEqual(response.status_code, 200)
        self.assertTrue(is_json(response.data))

    def test_user_data(self):
        response = self.app.get('/api/users')
        self.assertEqual(response.status_code, 200)
        self.assertTrue(is_json(response.data))

def login(client, username, password):
    login_dict = dict(
        username=username,
        password=password
    )

    return client.post('/api/login',
            data=json.dumps(login_dict),
            content_type='application/json',
            follow_redirects=True)

def is_json(json_str):
    try:
        json.loads(json_str)
    except ValueError, e:
        return False
    
    return True

if __name__ == '__main__':
    unittest.main()