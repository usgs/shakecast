import json
import os
import types

from sqlalchemy.ext.declarative import DeclarativeMeta, declarative_base


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
                    # this will fail on non-encodable values, like other classes
                    json.dumps(data)
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

class GeoJsonFeatureCollection(dict):
    def __init__(self):
        self['type'] = 'FeatureCollection'
        self['features'] = []
    
    def add_feature(self, feature):
        self['features'] += [feature]


def get_geojson_latlon(obj):
    # check for lat/lon
    if (type(obj.get('lat', False)) is not bool) and (type(obj.get('lon', False)) is not bool):
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
