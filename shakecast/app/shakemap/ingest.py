import json
import os
from shakecast.app.env import MINIMUM_MAGNITUDE
from shakecast.app.orm.objects import Event, Group
import time

from ..eventprocessing import process_shakemaps
from ..orm import dbconnect, ShakeMap


@dbconnect
def assess_shakemapo(shakemap=ShakeMap(), session=None):
    groups_affected = session.query(Group).filter(Group.point_inside(shakemap)).first()
    if groups_affected: 
        return True
    
    return False

def read_shakemap_info(info_path):
    with open(info_path, 'r') as file_:
      json_str = file_.read()
      shakemap_dict = json.loads(json_str)

    return shakemap_dict

@dbconnect
def main(message, session=None):
    product_path = message['directory']
    info = get_info_from_directory(product_path)
    shakemap = transform_info_to_shakemap(info)
    shakemap.shakemap_id = message['eventId']

    shakemap.override_directory = os.path.join(product_path, 'download')
    print(f'Adding new shakemap: {shakemap.shakemap_id}')

    event = session.query(Event).filter(Event.event_id).first()
    shakemap.event = event

    session.add(shakemap)
    session.commit()
    if event:
        try:
            process_shakemaps([shakemap], session=session)
        except Exception as e:
            print(str(e))
            shakemap.status = 'error'
            session.commit()
    else:
        print(f'No event associated with shakemap: {shakemap.shakemap_id}')
        shakemap.status = 'No event associated'

@dbconnect
def ingest_update(origin_xml_path, session=None):
    pass

def get_info_from_directory(directory):
    shakemap_info_path = os.path.join(directory, 'download', 'info.json')
    info = read_shakemap_info(shakemap_info_path)
    return info

def transform_info_to_shakemap(info):
    print(info['input'])
    shakemap = ShakeMap(
      shakemap_version = info['processing']['shakemap_versions']['map_version'],
      status = 'new',
      type = 'actual',
      region = info['input']['event_information']['netid'],
      lat_min = info['output']['map_information']['min']['latitude'],
      lat_max = info['output']['map_information']['max']['latitude'],
      lon_min = info['output']['map_information']['min']['longitude'],
      lon_max = info['output']['map_information']['max']['longitude'],
      lat = info['input']['event_information']['latitude'],
      lon = info['input']['event_information']['longitude'],
      magnitude = info['input']['event_information']['magnitude'],
      description = info['input']['event_information']['location'],
      generation_timestamp = info['processing']['shakemap_versions']['process_time'],
      recieve_timestamp = str(time.time())
    )

    return shakemap