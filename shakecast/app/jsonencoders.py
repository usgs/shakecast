import json
import types
import os
from sqlalchemy import inspect

from sqlalchemy.ext.declarative import DeclarativeMeta
from .orm import Base, FacilityShaking

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



class ImpactGeoJson(object):
    def __init__(self):
        self.facility_shaking = []
        self.facility_count = 0
        self.geo_json = {'type': 'FeatureCollection',
                    'features': [],
                    'properties': {}}
    
    def init_features(self, count):
        self.geo_json['features'] = [None] * count
        self.facility_shaking = [None] * count

    def add_facility_shaking(self, facility, fac_shaking):
        self.facility_shaking[self.facility_count] = FacilityShaking(**fac_shaking)

        fac_shaking_dict = self.make_impact_geo_json_dict(
                facility, fac_shaking)
        self.geo_json['features'][self.facility_count] = fac_shaking_dict

        self.facility_count += 1

    def make_impact_geo_json_dict(self, facility, fac_shaking):
        json_dict = {
            'type': 'Feature',
            'geometry': {
                'type': 'Point',
                'coordinates': [facility.lon, facility.lat]
            }
        }

        json_dict['properties'] = {
            'facility_name': facility.name,
            'description': facility.description,
            'facility_type': facility.facility_type,
            'lat': facility.lat,
            'lon': facility.lon,
            'shaking': fac_shaking
        }

        return json_dict

    def save_impact_geo_json(self, directory, name='impact.json', geo_json=None):
        geo_json = geo_json or self.geo_json
        json_file = os.path.join(directory, 'impact.json')

        with open(json_file, 'w') as f_:
            f_.write(json.dumps(geo_json))

def sql_to_obj(sql):
    '''
    Convert SQLAlchemy objects into dictionaries for use after
    session closes
    '''

    if isinstance(sql, Base):
        obj = {}

        sql_class = type(sql)
        class_keys = inspect(sql_class).all_orm_descriptors.keys()

        filtered_keys = [key for key in class_keys if '__' not in key and key[0] != '_']
        for attribute in filtered_keys:
            if not obj.get(attribute, False):
                try:
                    obj_attr = getattr(sql, attribute)

                    # don't include functions
                    if (not hasattr(obj_attr, '__call__') and
                            not isinstance(obj_attr, Base) and
                            not isinstance(obj_attr, list) and
                            not isinstance(obj_attr, dict)):
                        obj[attribute] = obj_attr
                except:
                    # can't access it for some reason
                    pass
        
        sql = obj

    elif isinstance(sql, list):
        obj = []

        for item in sql:
            if (isinstance(item, dict) or
                    isinstance(item, list) or
                    isinstance(item, Base)):
                obj.append(sql_to_obj(item))

    elif isinstance(sql, dict):
        obj = {}

        # remove sqlalchemy state
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

class GeoJson(dict):
    def __init__(self):
        self['type'] = 'Feature'
        self['geometry'] = {'type': 'Point', 'coordinates': None}
        self['properties'] = {}
    
    def set_coordinates(self, coordinates):
        self['geometry']['coordinates'] = coordinates

        if isinstance(coordinates[0], list):
            self['geometry']['type'] = 'Polygon'

    def set_feature_type(self, feature_type):
        self['geometry']['type'] = feature_type

    def set_property(self, property_, value):
        self['properties'][property_] = value
    
    def get_json(self, indent=0):
        return json.dumps(self, indent=indent)

    def digest_sql(self, sql):
        obj = sql_to_obj(sql)
        self.set_coordinates(get_geojson_latlon(obj))
        self['properties'].update(obj)


def get_geojson_latlon(obj):
    # check for lat/lon
    if obj.get('lat', False) and obj.get('lon', False):
        return [obj['lon'], obj['lat']]
    
    elif (obj.get('lat_max', False) and
            obj.get('lon_max', False) and
            obj.get('lat_min', False) and
            obj.get('lon_min', False)):
        return [
            [
                [obj['lon_max'], obj['lat_min']],
                [obj['lon_max'], obj['lat_max']],
                [obj['lon_min'], obj['lat_max']],
                [obj['lon_min'], obj['lat_min']],
                [obj['lon_max'], obj['lat_min']]
            ]
        ]
