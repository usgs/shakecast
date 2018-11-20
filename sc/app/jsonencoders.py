import json
import types
import os

from orm import DeclarativeMeta, Base

class AlchemyEncoder(json.JSONEncoder):
    '''
    Use as the JSON encoder when passing SQLAlchemy objects to the 
    web UI
    '''
    def default(self, obj):
        if isinstance(obj.__class__, DeclarativeMeta):
            # an SQLAlchemy class
            fields = {}
            for field in [x for x in dir(obj) if not x.startswith('_') 
                                and x != 'metadata' and x != '_sa_instance_state']:
                data = obj.__getattribute__(field)

                if isinstance(data, types.MethodType):
                    continue

                try:
                    json.dumps(data) # this will fail on non-encodable values, like other classes
                    fields[field] = data
                except TypeError:
                    try:
                        fields[field] = [str(d) for d in data]
                    except:
                        fields[field] = None
                except UnicodeEncodeError:
                    fields[field] = 'Non-encodable'
            # a json-encodable dict
            return fields
    
        return json.JSONEncoder.default(self, obj)

def makeImpactGeoJSONDict(facility, fac_shaking):
    jsonDict = {
        'type': 'Feature',
        'geometry': {
            'type': 'Point',
            'coordinates': [facility.lon, facility.lat]
        }
    }

    jsonDict['properties'] = {
        'facility_name': facility.name,
        'description': facility.description,
        'facility_type': facility.facility_type,
        'lat': facility.lat,
        'lon': facility.lon,
        'shaking': fac_shaking
    }

    return jsonDict

def saveImpactGeoJson(shakemap, geoJSON):
    json_file = os.path.join(shakemap.directory_name,
                                'impact.json')

    with open(json_file, 'w') as f_:
        f_.write(json.dumps(geoJSON))

def sql_to_obj(sql):
    '''
    Convert SQLAlchemy objects into dictionaries for use after
    session closes
    '''

    if isinstance(sql, Base):
        sql = sql.__dict__

    if isinstance(sql, list):
        obj = []

        for item in sql:
            if (isinstance(item, dict) or
                    isinstance(item, list) or
                    isinstance(item, Base)):
                obj.append(sql_to_obj(item))

    elif isinstance(sql, dict):
        obj = {}

        if sql.get('_sa_instance_state', False):
            sql.pop('_sa_instance_state')

        for key in sql.keys():
            item = sql[key]
            if isinstance(item, Base) or isinstance(item, dict):
                item = sql_to_obj(item)
            
            elif isinstance(item, list):
                for obj in item:
                    if isinstance(obj, Base):
                        item = sql_to_obj(item)
            
            obj[key] = item

    else:
        obj = sql

    return obj