import unittest

from shakecast.app.orm import dbconnect, engine, metadata
from shakecast.app.orm.data import load_data
from shakecast.app.orm.util import check_testing

class BaseTest(unittest.TestCase):

  @staticmethod
  def setUp():
    # if we're testing, we want to drop all existing database info to test
    # from scratch
    if check_testing() is True:
        metadata.drop_all(engine)
        metadata.create_all(engine)

        load_data()

