import json
import os
import time

from ..eventprocessing import process_shakemaps
from ..orm import dbconnect, Event, Group

@dbconnect
def assess_shakemap(event=Event(), session=None):
    groups_affected = session.query(Group).filter(Group.point_inside(event)).first()
    if groups_affected:
        return True
    
    return False

def read_shakemap_json(shakemap_json_path):
    with open(shakemap_json_path, 'r') as file_:
      json_ = file_.read()
    
    return json.loads(json_)


@dbconnect
def main(product, session=None):
    # info_json_path = os.path.join(product_path, 'download','info.json')
    # shakemap = transform_shakemap(info_json_path)

    print(product)
    # if assess_shakemap(shakemap):
    #     print(f'Adding new shakemap: {shakemap.shakemap_id}')
    #     event.status = 'new'

    #     session.add(event)
    #     session.commit()

    #     process_shakemaps([event], session=session)
    # else:
    #     print(f'New event {event.event_id} does not meet import criteria')

def transform_shakemap(shakemap_json_path):
    shakemap = read_shakemap_json(shakemap_json_path)['properties']

    return shakemap