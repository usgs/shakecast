import json
import os
import time
import xml.etree.ElementTree as ET
import xmltodict

from ..env import MINIMUM_MAGNITUDE
from ..eventprocessing import process_events
from ..orm import dbconnect, Event, Group

@dbconnect
def assess_event(event=Event(), session=None):
    groups_affected = session.query(Group).filter(Group.point_inside(event)).first()
    if groups_affected and event.magnitude > MINIMUM_MAGNITUDE:
        return True
    
    return False

def read_origin_xml(origin_xml_path):
    with open(origin_xml_path, 'r') as file_:
      xml_str = file_.read()
      xml_dict = json.loads(json.dumps(xmltodict.parse(xml_str)))
      
      xml_dict['properties'] = {}
      for property in xml_dict['product']['property']:
          xml_dict['properties'][property['@name']] = property['@value']
    return xml_dict

@dbconnect
def main(message, session=None):
    product_path = message['directory']
    origin = get_origin_from_directory(product_path)
    event = transform_origin_to_event(origin)
    event.event_id = message.get('eventId')

    if assess_event(event):
        print(f'Adding new event: {event.event_id}')
        event.status = 'new'

        session.add(event)
        session.commit()

        process_events([event], session=session)
    else:
        print(f'New event {event.event_id} does not meet import criteria')

@dbconnect
def ingest_update(origin_xml_path, session=None):
    origin = read_origin_xml(origin_xml_path)

def get_origin_from_directory(directory):
    origin_xml_path = os.path.join(directory, 'product.xml')
    origin = read_origin_xml(origin_xml_path)['properties']

    return origin

def transform_origin_to_event(origin):

    event = Event(
      event_id = origin.get('eventId'),
      title = origin.get('title'),
      place = origin.get('place'),
      time = origin.get('time'),
      magnitude = float(origin.get('magnitude')),
      lon = float(origin.get('longitude')),
      lat = float(origin.get('latitude')),
      depth = float(origin.get('depth')),
      type = 'event',
      updated = str(time.time())
    )

    event.time = event.time / 1000.0 if event.time else time.time()

    return event