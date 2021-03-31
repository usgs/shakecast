import csv
import json
import os

from ..notifications.templates import TemplateManager


def generate_impact_csv(shakemap, group=None, save=False, file_name='', template_name=''):
    '''
    Generate CSV product containing shaking information from an event
    '''

    if group:
        facility_shaking = [x for x in shakemap.facility_shaking if group in x.facility.groups]
    else:
        facility_shaking = shakemap.facility_shaking

    tm = TemplateManager()
    configs = tm.get_configs('csv', template_name or 'default.json')

    headers = [x for x in configs['headers'] if x['use'] is True]
    csv_rows = [[header['name'] for header in headers]]

    facility_shaking_lst = sorted(facility_shaking,
                                  key=lambda x: x.impact_rank, reverse=True)

    for fac_shaking in facility_shaking_lst:
        facility_row = []
        for header in headers:
            head_key = header['val']
            val = ''
            if (getattr(fac_shaking, head_key, False)
                    or getattr(fac_shaking, head_key, None) is not None):
                val = getattr(fac_shaking, head_key)
            elif (getattr(fac_shaking.facility, head_key, False) or
                    getattr(fac_shaking.facility, head_key, None) is not None):
                val = getattr(fac_shaking.facility, head_key)
            elif fac_shaking.facility.get_attribute(head_key):
                val = fac_shaking.facility.get_attribute(head_key)

            if header.get('translate', False):
                val = header['translate'][val]

            facility_row += [val]
        csv_rows += [facility_row]

    if save is True:
        file_name = file_name or 'impact.csv'
        save_csv(csv_rows, file_name, shakemap.local_products_dir)
    return csv_rows


def save_csv(csv_rows, file_name, directory):
    file_name = os.path.join(directory, file_name)
    with open(file_name, 'w') as csv_file:
        csv_writer = csv.writer(csv_file)
        for row in csv_rows:
            csv_writer.writerow(row)


def main(group, shakemap, name):
    return generate_impact_csv(shakemap, save=True, group=group, file_name=name, template_name=group.template)
