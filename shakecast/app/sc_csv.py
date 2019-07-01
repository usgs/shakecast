import csv
import json
import os

from .notifications import TemplateManager

def generate_impact_csv(shakemap, save=False, file_name='', template_name=''):
    '''
    Generate CSV product containing shaking information from an event
    '''

    tm = TemplateManager()
    configs_json = tm.get_configs('csv', template_name or 'default.json')
    configs = json.loads(configs_json)

    headers = configs['headers'].filter(lambda x: x['use'] is True)
    csv_rows = [[header['name'] for header in headers]]

    for fac_shaking in shakemap.facility_shaking:
        facility_row = []
        for header in headers:
            head_key = header['val']
            val = ''
            if fac_shaking.__dict__.get(head_key, False):
                val = fac_shaking.__dict__(head_key)
            elif fac_shaking.facility__dict__.get(head_key, False):
                val = fac_shaking.facility.__dict__(head_key)
            elif fac_shaking.facility.get_attribute(head_key):
                val = fac_shaking.facility.get_attribute(head_key)

            facility_row += [val]
        csv_rows += facility_row

    if save is True:
        file_name = file_name or 'impact.csv'
        save_csv(csv_rows, file_name, shakemap.local_products_dir)
    return csv_rows

def save_csv(csv_rows, file_name, directory):
    file_name = os.path.join(directory, file_name)
    with open(file_name, 'wb') as csv_file:
        csv_writer = csv.writer(csv_file)
        for row in csv_rows:
            csv_writer.writerow(row)
