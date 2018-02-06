import math
import os
import json
import datetime
import time
from shutil import copyfile
import collections

DAY = 60 * 60 * 24

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
        self.conf_file_location = ''
        self.map_key = ''
    
        self.load()
    
    def load(self):
        """
        Load information from database to the SC object
        
        Returns:
            None
        """
        
        conf_dir = self.get_conf_dir()
        self.conf_file_location = os.path.join(conf_dir, 'sc.json')
            
        conf_file = open(self.conf_file_location, 'r')
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
        with open(self.conf_file_location, 'w') as conf_file:
            conf_file.write(json_str)
    
    @staticmethod
    def get_conf_dir():
        """
        Determine where the conf directory is
        
        Returns:
            str: The absolute path the the conf directory
        """
        
        # Get directory location for database
        path = os.path.dirname(os.path.abspath(__file__))
        delim = get_delim()
        path = path.split(delim)
        path[-1] = 'conf'
        directory = os.path.normpath(delim.join(path))
        
        return directory
    
    def make_backup(self):
        conf_dir = self.get_conf_dir()
        # copy sc_config file
        copyfile(os.path.join(conf_dir, 'sc.json'),
                 os.path.join(conf_dir, 'sc_back.json'))
        
    def revert(self):
        conf_dir = self.get_conf_dir()
        # copy sc_config file
        copyfile(os.path.join(conf_dir, 'sc_back.json'),
                 os.path.join(conf_dir, 'sc.json'))
        self.load()


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


"""
Functions used by the functions module
"""
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

def root_dir():
    """
    Returns the path of the root directory for the shakecast application
    """
    path = sc_dir().split(get_delim())
    del path[-1]
    directory = os.path.normpath(get_delim().join(path))
    
    return directory

def lognorm_opt(med=0, spread=0, shaking=0):
    '''
    Lognormal calculation to determine probability of exceedance
    
    Args:
        med (float): Median value that might be exceeded
        spread (float): Uncertainty in the median value
        shaking (float): recorded shaking value
    
    Returns:
        float: probability of exceedance as a human readable percentage
    '''
    
    p_norm = (math.erf((shaking-med)/(math.sqrt(2) * spread)) + 1)/2
    return p_norm * 100

def merge_dicts(dct, merge_dct):
    """ Recursive dict merge. Inspired by :meth:``dict.update()``, instead of
    updating only top-level keys, merge_dicts recurses down into dicts nested
    to an arbitrary depth, updating keys. The ``merge_dct`` is merged into
    ``dct``.
    :param dct: dict onto which the merge is executed
    :param merge_dct: dct merged into dct
    :return: None

    @angstwad: https://gist.github.com/angstwad/bf22d1822c38a92ec0a9
    """
    for k in merge_dct:
        if (k in dct and isinstance(dct[k], dict)
                and isinstance(merge_dct[k], collections.Mapping)):
            merge_dicts(dct[k], merge_dct[k])
        else:
            dct[k] = merge_dct[k]