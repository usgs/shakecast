'''
Allows a user (or AppVeyor) to specify configurations through the
command line

Usage: python sc_config.py -[flag] -value
    Flags:
        -d      dict    Dictionary containing multiple keys and values
        -smtpu  str     Sets smtp username, from, and envelope_from
        -smtpp  str     Sets smtp password
        -host   str     Sets the host name of the ShakeCast server
'''

import argparse
from util import SC
import json

def sc_config(new_configs={}):
    sc = SC()
    sc_config = json.loads(sc.json)

    for key, value in new_configs.iteritems():
        if key in sc_config:
            if not isinstance(new_configs[key], dict):
                sc_config[key] = value
            else:
                for i_key, i_value in new_configs[key].iteritems():
                    sc_config[key][i_key] = i_value
                    
    sc.json = json.dumps(sc_config)
    if sc.validate(sc.json) is True:
        sc.save(sc.json)

parser = argparse.ArgumentParser()
parser.add_argument('-d', '--dict', type=dict,
                    help='A dictionary with keys and values that match sc.json')
parser.add_argument('--smtpu', type=str,
                    help='Set the smtp username and from')
parser.add_argument('--smtpp', type=str,
                    help='Set the smtp password')
parser.add_argument('--host', type=str,
                    help='Set the host name of the ShakeCast server')

args = parser.parse_args()

if args.dict is None:
    new_configs = {}
    if args.smtpu and args.smtpp:
        new_configs.update({
            'SMTP': {
                'username': args.smtpu,
                'from': args.smtpu,
                'password': args.smtpp
            }
        })

    if args.host:
        new_configs.update({'host': args.host})
    
    # get rid of options that weren't specified
    new_configs = {k:v for k,v in new_configs.iteritems()
                                        if v is not None}
    for key, conf in new_configs.iteritems():
        if isinstance(conf, dict):
            new_configs[key] = {k:v for k,v in new_configs[key].iteritems()
                                    if v is not None}
            
else:
    new_configs = args.dict
    
sc_config(new_configs=new_configs)