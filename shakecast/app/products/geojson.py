import json
import os

from ..impact import get_event_impact

class ImpactGeoJson(object):
    def __init__(self):
        self.facility_shaking = []
        self.facility_count = 0
        self.geo_json = {'type': 'FeatureCollection',
                    'features': [],
                    'properties': {}}
    
    def init_features(self, count):
        self.geo_json['features'] = [None] * count
        self.facility_shaking = []

    def add_facility_shaking(self, facility, fac_shaking):
        self.facility_shaking += [fac_shaking]

        self.geo_json['features'][self.facility_count] = fac_shaking.geojson

        self.facility_count += 1

    def save_impact_geo_json(self, directory, name='impact.json', geo_json=None):
        geo_json = geo_json or self.geo_json
        json_file = os.path.join(directory, name)

        with open(json_file, 'w') as f_:
            f_.write(json.dumps(geo_json))

def generate_impact_geojson(shakemap, group=None, save=False, name='impact.json'):
    if group:
        facility_shaking = filter(lambda x: group in x.facility.groups, shakemap.facility_shaking)
    else:
        facility_shaking = shakemap.facility_shaking
    
    impact = ImpactGeoJson()
    impact.init_features(len(facility_shaking))

    for each_fac_shaking in facility_shaking:
        if not each_fac_shaking:
            continue

        impact.add_facility_shaking(each_fac_shaking.facility, each_fac_shaking)

    impact.geo_json['properties']['impact-summary'] = get_event_impact(
        impact.facility_shaking)
    
    if save:
        impact.save_impact_geo_json(shakemap.local_products_dir, name)

    return impact


def main(group, shakemap, name):
    return generate_impact_geojson(shakemap, group=group, save=True)