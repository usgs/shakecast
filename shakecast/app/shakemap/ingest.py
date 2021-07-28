import json
import os
import time

from ..eventprocessing import process_shakemaps
from ..orm import dbconnect, ShakeMap


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

    shakemap.override_directory = os.path.join(product_path, 'download')
    print(f'Adding new event: {shakemap.shakemap_id}')

    session.add(shakemap)
    session.commit()

    process_shakemaps([shakemap], session=session)

@dbconnect
def ingest_update(origin_xml_path, session=None):
    pass

def get_info_from_directory(directory):
    shakemap_info_path = os.path.join(directory, 'download', 'info.json')
    info = read_shakemap_info(shakemap_info_path)
    return info

def transform_info_to_shakemap(info):
    shakemap = ShakeMap(
      shakemap_id = info['input']['event_information']['event_id'],
      shakemap_version = info['processing']['shakemap_versions']['map_version'],
      status = 'new',
      type = 'actual',
      region = info['input']['event_information']['netid'],
      lat_min = info['output']['map_information']['min']['latitude'],
      lat_max = info['output']['map_information']['max']['latitude'],
      lon_min = info['output']['map_information']['min']['longitude'],
      lon_max = info['output']['map_information']['max']['longitude'],
      generation_timestamp = info['processing']['shakemap_versions']['process_time'],
      recieve_timestamp = str(time.time())
    )

    return shakemap