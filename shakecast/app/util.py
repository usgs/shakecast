import math
import os, sys
import json
import datetime
import time
from shutil import copyfile
import shutil
from collections import Mapping

class SC(object):
    """
    Holds application custimization settings
    
    Attributes:
        timezone (int): How many hours to offset from UTC
        new_eq_mag_cutoff (float): Lowest magnitude earthquake app stores
        check_new_int (int): how often to check db for new eqs
        use_geo_json (bool): False if using PDL
        geo_json_web (str): The web address where app gets json feed
        geo_json_int (int): How many seconds between running geo_json
        archive_mag (float): Min mag that is auto-archived
        keep_eq_for (int): Days before eq is deleted
        eq_req_products (list): Which products should be downloaded from web
        log_rotate (int): Days between log rotations
        log_file (str): Name of the log file
        log_level (str): Low, Normal, or High
        db_type (str): sqlite, mysql, ... (only tested with sqlite)
        db_password (str): For access to database
        db_username (str): For access to database
        db_retry_count (int): Attempts to access db
        db_retry_interval (int): Wait time between attempts to access db
        smtp_server (str): Name of smtp (smtp.gmail.com)
        smtp_security (str): SSL, TLS
        smtp_port (int): Default 587 for SMTP
        smtp_password (str): for SMTP access
        smtp_username (str): for SMTP access
        smtp_envelope_from (str): Mail to be sent from
        smtp_from (str): Mail to be sent from
        default_template_new_event (str): New event notification template name
        default_template_inspection (str): Inspection notificaiton template name
        default_template_pdf (str): PDF template name
        use_proxy (bool): Whether or not to traffic through proxy
        proxy_username (str): For proxy access
        proxy_password (str): For proxy access
        proxy_server (str): Name of proxy server
        proxy_port (int): Which port to use for proxy
        server_name (str): What the admin chooses to call the instance
        server_dns (str): How the instance is accessed
        software_version (str): Implemented pyCast software
        gmap_key (str): Holds the google maps key, used for static maps
    """
    
    def __init__(self):
        self.timezone = 0
        self.new_eq_mag_cutoff = 0.0
        self.night_eq_mag_cutoff = 0.0
        self.nighttime = 0
        self.morning = 0
        self.check_new_int = 0
        self.use_geo_json = False
        self.geo_json_web = ''
        self.geo_json_int = 0
        self.archive_mag = 0.0
        self.keep_eq_for = 0
        self.eq_req_products = []
        self.ignore_nets = []
        self.log_rotate = 0
        self.log_file = ''
        self.log_level = 0
        self.db_type = ''
        self.db_password = ''
        self.db_username = ''
        self.db_retry_count = 0
        self.db_retry_interval = 0
        self.smtp_server = ''
        self.smtp_security = ''
        self.smtp_port = 0
        self.smtp_password = ''
        self.smtp_username = ''
        self.smtp_envelope_from = ''
        self.smtp_from = ''
        self.default_template_new_event = ''
        self.default_template_inspection = ''
        self.default_template_pdf = ''
        self.use_proxy = False
        self.proxy_username = ''
        self.proxy_password = ''
        self.proxy_server = ''
        self.proxy_port = 0
        self.server_name = ''
        self.server_dns = ''
        self.software_version = ''
        self.json = ''
        self.map_key = ''

        self.load()
    
    def load(self):
        """
        Load information from database to the SC object
        
        Returns:
            None
        """
        conf_file_location = os.path.join(get_conf_dir(), 'sc.json')
        with open(conf_file_location, 'r') as conf_file:
            conf_str = conf_file.read()
            self.json = conf_str
            conf_json = json.loads(conf_str)
            self.dict = conf_json

        # timezone
        self.timezone = conf_json['timezone']
        self.map_key = conf_json['map_key']
        
        # Services
        self.new_eq_mag_cutoff = conf_json['Services']['new_eq_mag_cutoff']
        self.night_eq_mag_cutoff = conf_json['Services']['night_eq_mag_cutoff']
        self.nighttime = conf_json['Services']['nighttime']
        self.morning = conf_json['Services']['morning']
        self.check_new_int = conf_json['Services']['check_new_int']
        self.use_geo_json = conf_json['Services']['use_geo_json']
        self.geo_json_int = conf_json['Services']['geo_json_int']
        self.archive_mag = conf_json['Services']['archive_mag']
        self.keep_eq_for = conf_json['Services']['keep_eq_for']
        self.geo_json_web = conf_json['Services']['geo_json_web']
        self.ignore_nets = conf_json['Services']['ignore_nets']
        self.eq_req_products = conf_json['Services']['eq_req_products']
        
        # DBConnection
        self.db_type = conf_json['DBConnection']['type']
        self.db_password = conf_json['DBConnection']['password']
        self.db_username = conf_json['DBConnection']['username']
        self.db_retry_count = conf_json['DBConnection']['retry_count']
        self.db_retry_interval = conf_json['DBConnection']['retry_interval']
        
        # SMTP
        self.smtp_server = conf_json['SMTP']['server']
        self.smtp_security = conf_json['SMTP']['security']
        self.smtp_port = conf_json['SMTP']['port']
        self.smtp_password = conf_json['SMTP']['password']
        self.smtp_username = conf_json['SMTP']['username']
        self.smtp_envelope_from = conf_json['SMTP']['envelope_from']
        self.smtp_from = conf_json['SMTP']['from']
        
        # Notification
        self.default_template_new_event = conf_json['Notification']['default_template_new_event']
        self.default_template_inspection = conf_json['Notification']['default_template_inspection']
        self.default_template_pdf = conf_json['Notification']['default_template_pdf']
        
        # Proxy
        self.use_proxy = conf_json['Proxy']['use']
        self.proxy_username = conf_json['Proxy']['username']
        self.proxy_password = conf_json['Proxy']['password']
        self.proxy_server = conf_json['Proxy']['server']
        self.proxy_port = conf_json['Proxy']['port']
        
        # Server
        self.server_name = conf_json['Server']['name']
        self.server_dns = conf_json['Server']['DNS']
        self.software_version = conf_json['Server']['update']['software_version']
    
    @staticmethod
    def validate(self, json_str=None):
        return True

    def save_dict(self):
        json_str = json.dumps(self.dict, indent=4)
        self.save(json_str)
    
    def save(self, json_str):
        conf_dir = get_conf_dir()
        conf_file_location = os.path.join(conf_dir, 'sc.json')
        if not os.path.isdir(conf_dir):
            os.makedirs(conf_dir)

        with open(conf_file_location, 'w') as conf_file:
            conf_file.write(json_str)
    
    def make_backup(self):
        conf_dir = get_conf_dir()
        # copy sc_config file
        copyfile(os.path.join(conf_dir, 'sc.json'),
                 os.path.join(conf_dir, 'sc_back.json'))
        
    def revert(self):
        conf_dir = get_conf_dir()
        # copy sc_config file
        copyfile(os.path.join(conf_dir, 'sc_back.json'),
                 os.path.join(conf_dir, 'sc.json'))
        self.load()

    def generate(self):
        self.dict = {
            'web_port': 80, 
            'DBConnection': {
                'username': '', 
                'database': 'shakecast', 
                'retry_interval': 0, 
                'server': 'localhost', 
                'retry_count': 0, 
                'password': '', 
                'type': 'sqlite'
            }, 
            'Notification': {
                'default_template_new_event': 'default_ne.json', 
                'default_template_inspection': 'default_insp.json', 
                'default_template_pdf': 'default_pdf.json', 
                'max_facilities': 200, 
                'notify': True
            }, 
            'SMTP': {
                'username': '', 
                'from': '', 
                'envelope_from': '', 
                'server': 'smtp.gmail.com', 
                'security': 'TLS', 
                'password': '', 
                'port': 587
            }, 
            'Server': {
                'update': {
                    'json_url': 'https://raw.githubusercontent.com/usgs/shakecast/master/update.json', 
                    'db_version': 1, 
                    'update_version': '4.0.6', 
                    'admin_notified': False, 
                    'software_version': '4.0.6'
                }, 
                'DNS': 'https://localhost', 
                'name': 'ShakeCast'
            },
            'map_key': 'pk.eyJ1IjoiZHNsb3NreSIsImEiOiJjaXR1aHJnY3EwMDFoMnRxZWVtcm9laWJmIn0.1C3GE0kHPGOpbVV9kTxBlQ', 
            'host': 'localhost', 
            'extensions': [], 
            'Proxy': {
                'username': '', 
                'use': False, 
                'password': '', 
                'port': 0, 
                'server': ''
            }, 
            'data_directory': '', 
            'timezone': 0, 
            'Services': {
                'use_geo_json': True, 
                'ignore_nets': 'at,pt', 
                'new_eq_mag_cutoff': 3, 
                'keep_eq_for': 60, 
                'eq_req_products': [
                    'grid.xml', 
                    'intensity.jpg'
                ], 
                'check_new_int': 3, 
                'eq_pref_products': [
                    'grid.xml', 
                    'stationlist.xml', 
                    'intensity.jpg', 
                    'ii_overlay.png'
                ], 
                'night_eq_mag_cutoff': 0, 
                'geo_json_web': 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_{}.geojson', 
                'nighttime': 18, 
                'morning': 9, 
                'archive_mag': 5, 
                'geo_json_int': 60
            }, 
            'Logging': {
                'level': 'info'
            }, 
            'user_directory': '', 
            'port': 1981
        }
        self.save_dict()

class Clock(object):
    '''
    Keeps track of utc and application time as well as night and day
    
    Attributes:
        utc_time (str): current utc_time
        app_time (str): current time for application users
    '''
    def __init__(self):
        self.utc_time = ''
        self.app_time = ''
        
    def nighttime(self):
        '''
        Determine if it's nighttime
        
        Returns:
            bool: True if nighttime
        '''
        sc = SC()
        
        # get app time
        self.get_time()
        # compare to night time setting
        hour = int(self.app_time.strftime('%H'))        
        return bool(((hour >= sc.nighttime)
                        or hour < sc.morning))
        
    def get_time(self):
        sc = SC()
        self.utc_time = datetime.datetime.utcfromtimestamp(time.time())
        self.app_time = self.utc_time + datetime.timedelta(hours=sc.timezone)
        
    def from_time(self, time):
        sc = SC()
        utc_time = datetime.datetime.utcfromtimestamp(time)
        app_time = utc_time + datetime.timedelta(hours=sc.timezone)
        
        return app_time


def get_delim():
    """
    Returns which delimeter is appropriate for the operating system
    """
    return os.sep

def sc_dir():
    """
    Returns the path of the sc directory for the shakecast application
    """
    path = os.path.dirname(os.path.abspath(__file__))
    delim = get_delim()
    path = path.split(delim)
    del path[-1]
    directory = os.path.normpath(delim.join(path))
    
    return directory

def get_user_dir():
    '''
    Establishes a directory named in the config file for persistent data storage. The
    default is ~/.shakecast
    '''

    user_set_dir = os.environ.get('SHAKECAST_USER_DIRECTORY')
    home_dir = os.path.expanduser('~')
    default_home_dir = os.path.join(home_dir, '.shakecast')

    return user_set_dir or default_home_dir

def get_logging_dir():
    home_dir = get_user_dir()
    path = os.path.join(home_dir, 'logs')

    return path

def get_local_products_dir():
    home_dir = get_user_dir()
    path = os.path.join(home_dir, 'local_products')

    return path

def get_template_dir():
    home_dir = get_user_dir()
    path = os.path.join(home_dir, 'templates')

    return path

def get_default_template_dir():
    if os.environ.get('SC_DOCKER', False) is not False:
        default_dir = os.path.join(sc_dir(), 'backups', 'templates')
    else:
        default_dir = os.path.join(sc_dir(), 'templates')

    return default_dir

def get_db_dir():
    home_dir = get_user_dir()
    path = os.path.join(home_dir, 'db')

    return path

def get_tmp_dir():
    home_dir = get_user_dir()
    path = os.path.join(home_dir, 'tmp')

    return path

def get_conf_dir():
    '''
    Get configurable config directory by opening the default config location
    '''
    home_dir = get_user_dir()
    config_dir = os.path.join(home_dir, 'conf')

    return config_dir

def get_data_dir():
    '''
    Establishes a directory named in the config file for persistent storage of
    earthquake products. Default is ~/.shakecast/data
    '''
    home_dir = get_user_dir()
    data_dir = os.path.join(home_dir, 'data')
    
    return data_dir

def get_test_dir():
    '''
    Establishes a directory named in the config file for persistent storage of
    earthquake products. Default is ~/.shakecast/data
    '''
    sc_dir_ = sc_dir()
    test_dir = os.path.join(sc_dir_, 'tests')
    
    return test_dir

def get_version():
    '''
    Open the version file generated on publish and return the value
    '''
    version_file = os.path.join(sc_dir(), 'version')
    version = None

    if os.path.exists(version_file):
      with open(version_file, 'r') as file_:
          version = file_.read()
    
    return version

def root_dir():
    """
    Returns the path of the root directory for the shakecast application
    """
    path = sc_dir().split(get_delim())
    del path[-1]
    directory = os.path.normpath(get_delim().join(path))
    
    return directory

def merge_dicts(dct, merge_dct):
    """
    Merge keys at an arbitrary depth. Used for updating user configs
    """
    for k in merge_dct:
        if (k in dct and isinstance(dct[k], dict)
                and isinstance(merge_dct[k], Mapping)):
            merge_dicts(dct[k], merge_dct[k])
        else:
            dct[k] = merge_dct[k]

def lower_case_keys(input_dict):
    output_dict = {}
    for key in list(input_dict.keys()):
        if isinstance(key, str):
            output_dict[key.lower()] = input_dict[key]

    return output_dict

def non_null(input_dict):
    output_dict = {}
    for key in list(input_dict.keys()):
        if input_dict[key] is not None:
            output_dict[key] = input_dict[key]

    return output_dict

def on_windows():
    return 'win32' in sys.platform.lower()

def copy_dir(source, dest, indent = 0):
    """Copy a directory structure overwriting existing files"""
    for root, dirs, files in os.walk(source):
        if not os.path.isdir(root):
            os.makedirs(root)
        for each_file in files:
            rel_path = root.replace(source, '').lstrip(os.sep)
            dest_path = os.path.join(dest, rel_path, each_file)
            shutil.copyfile(os.path.join(root, each_file), dest_path)

def split_string_on_spaces(string, split_count):
    '''
    Break up a string to fit into PDF tables. Prefer to break strings
    on spaces
    '''
    string = str(string)
    split_string = string.split(' ')

    line = ''
    new_string = []
    for current_string in split_string:
        if len(line) + len(current_string) < split_count:
            if len(line) > 0:
                line += ' '

            line += current_string
        else:
            if len(line) + 1 > .5 * split_count:
                new_string += [line]
                line = ''
            
            remaining = current_string
            if line:
                remaining = '{} {}'.format(line, remaining)

            start_str_cut = 0
            while start_str_cut < len(remaining):
                end_str_cut = start_str_cut + split_count
                if end_str_cut > len(remaining):
                    end_str_cut = len(remaining)
                
                chunk = remaining[int(start_str_cut):int(end_str_cut)]
                start_str_cut = end_str_cut

                if start_str_cut < len(remaining):
                    new_string += [chunk]
                else:
                    line = chunk
    if line:
        new_string += [line]

    return new_string

def get_gps_distance(lat1, lon1, lat2, lon2):
  earthRadiusKm = 6371
  latDiff = degreesToRadians(lat2-lat1)
  lonDiff = degreesToRadians(lon2-lon1)

  lat1 = degreesToRadians(lat1)
  lat2 = degreesToRadians(lat2)

  a = (math.sin(latDiff/2) * math.sin(latDiff/2) +
          math.sin(lonDiff/2) * math.sin(lonDiff/2) *
          math.cos(lat1) * math.cos(lat2))

  c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
  return earthRadiusKm * c

def degreesToRadians(degrees):
  return degrees * math.pi / 180


DAY = 60 * 60 * 24
DEFAULT_CONFIG_DIR = os.path.join(sc_dir(), 'conf')
