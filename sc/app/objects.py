"""
This program holds all the non-database objects used necessary for
ShakeCast to run. These objects are used in the functions.py program
"""

import urllib2
import json
import os
import sys
import time
import xml.etree.ElementTree as ET
import smtplib
from functions_util import *
from dbi.db_alchemy import *

class Product_Grabber(object):
    
    """
    Able to access the USGS web, download products, and make entries
    in the database
    """
    
    def __init__(self,
                 req_products=[],
                 data_dir=''):
        
        sc = SC()
        
        self.req_products = req_products
        self.server_address = ''
        self.json_feed_url = sc.geo_json_web
        self.json_feed = ''
        self.earthquakes = {}
        self.data_dir = ''
        self.delim = ''
        self.log = ''
        
        if not self.req_products:
            self.req_products = sc.eq_req_products
        
        if data_dir == '':
            self.get_data_path()
    
    def get_data_path(self):
        """
        Gets the path to the data folder and sets the self.data_dir
        property
        """
        path = os.path.dirname(os.path.abspath(__file__))
        if os.name == 'nt':
            self.delim = '\\'
        else:
            self.delim = '/'
        path = path.split(self.delim)
        path[-1] = 'data'
        self.data_dir = self.delim.join(path) + self.delim
        
    def get_json_feed(self):
        """
        Pulls json feed from USGS web and sets the self.json_feed
        variable. Also makes a list of the earthquakes' IDs
        """
        
        try:
            json_str = urllib2.urlopen(self.json_feed_url, timeout=60)
        except:
            self.log += 'Unable to access JSON -- check internet connection\n'
            self.log += 'Error: %s' % sys.exc_info()[1]
            return
        
        self.json_feed = json.loads(json_str.read())
        json_str.close()
        
        #self.earthquakes = self.json_feed['features']
        
        for eq in self.json_feed['features']:
            # skip earthquakes without dictionaries... why does this
            # happen??
            try:
                if eq['id'] not in self.earthquakes.keys():
                    info = {'status': 'new'}
                    eq.update(info)
                    self.earthquakes[eq['id']] = eq
            except:
                continue
        
    def get_new_events(self):
        """
        Checks the json feed for new earthquakes
        """
        session = Session()
        sc = SC()
        
        event_str = ''
        new_events = []
        for eq_id in self.earthquakes.keys():
            eq = self.earthquakes[eq_id]
            
            # get event id and all ids
            event = Event()
            event.all_event_ids = self.earthquakes[eq_id]['properties']['ids']
            event.magnitude = self.earthquakes[eq_id]['properties']['mag']
            if event.magnitude < sc.new_eq_mag_cutoff:
                continue
            
            event.directory_name = '%s%s' % (self.data_dir,
                                             eq_id)
            if not os.path.exists(event.directory_name):
                os.makedirs(event.directory_name)
            
            # use id and all ids to determine if the event is new and
            # query the old event if necessary
            old_shakemaps = []
            if event.is_new() is False:
                ids = event.all_event_ids.strip(',').split(',')
                old_events = [(session.query(Event)
                                .filter(Event.event_id == each_id)
                                .first())
                                    for each_id in ids]
                
                for old_event in old_events:
                    if old_event is not None:
                        if (event.magnitude < (old_event.magnitude * .9) or
                                event.magnitude > (old_event.magnitude * 1.1)):
                            old_shakemaps += old_event.shakemaps
                            session.delete(old_event)
                            event.status = 'Update'
                            
                            # move all folder contents from previous events to current folder
                        else:
                            event.status = 'ignore'
            else:
                event.status = 'new'
                
            if event.status == 'ignore':
                continue
                        
            # Fill the rest of the event info
            event.event_id = eq_id
            event.title = self.earthquakes[eq_id]['properties']['title']
            event.place = self.earthquakes[eq_id]['properties']['place']
            event.time = self.earthquakes[eq_id]['properties']['time']
            
            event_coords = self.earthquakes[eq_id]['geometry']['coordinates']
            event.lon = event_coords[0]
            event.lat = event_coords[1]
            event.depth = event_coords[2]
            
            if old_shakemaps:
                event.shakemaps = old_shakemaps
            session.add(event)
            session.commit()
            
            new_events += [event]
            event_str += 'Event: %s\n' % event.event_id
        
        Session.remove()
        print event_str
        return new_events, event_str
            
    def get_new_shakemaps(self):
        """
        Checks the json feed for new earthquakes
        """
        session = Session()
        sc = SC()
        
        shakemap_str = ''
        new_shakemaps = []
        for eq_id in self.earthquakes.keys():
            eq = self.earthquakes[eq_id]
            
            eq_url = eq['properties']['detail']
            try:
                eq_str = urllib2.urlopen(eq_url, timeout=60)
            except:
                continue
            try:
                eq_info = json.loads(eq_str.read())
            except e:
                eq_info = e.partial       
            eq_str.close()
            
            # check if the event has a shakemap
            if 'shakemap' not in eq_info['properties']['products'].keys():
                continue
            
            # pulls the first shakemap associated with the event
            shakemap = ShakeMap()
            shakemap.json = eq_info['properties']['products']['shakemap'][0]
            shakemap.shakemap_id = eq_id
            shakemap.shakemap_version = shakemap.json['properties']['version']
            
            # check if we already have the shakemap
            if shakemap.is_new() is False:
                shakemap = (
                  session.query(ShakeMap)
                    .filter(ShakeMap.shakemap_id == shakemap.shakemap_id)
                    .filter(ShakeMap.shakemap_version == shakemap.shakemap_version)
                    .first()
                )
            
            # check if the shakemap has required products. If it does,
            # it is not a new map, and can be skipped
            if (shakemap.has_products(self.req_products)):
                continue
            
            # assign relevent information to shakemap
            shakemap.map_status = shakemap.json['properties']['map-status']
            shakemap.region = shakemap.json['properties']['eventsource']
            shakemap.lat_max = shakemap.json['properties']['maximum-latitude']
            shakemap.lat_min = shakemap.json['properties']['minimum-latitude']
            shakemap.lon_max = shakemap.json['properties']['maximum-longitude']
            shakemap.lon_min = shakemap.json['properties']['minimum-longitude']
            shakemap.generation_timestamp = shakemap.json['properties']['process-timestamp']
            shakemap.recieve_timestamp = time.time()
            shakemap.status = 'new'
            
            # make a directory for the new event
            shakemap.directory_name = '%s%s%s%s-%s' % (self.data_dir,
                                                   shakemap.shakemap_id,
                                                   get_delim(),
                                                   shakemap.shakemap_id,
                                                   shakemap.shakemap_version)
            if not os.path.exists(shakemap.directory_name):
                os.makedirs(shakemap.directory_name)
            
            
            
            # download products
            for product_name in self.req_products:
                product = Product(shakemap = shakemap,
                                  product_type = product_name)
                
                try:
                    product.json = shakemap.json['contents']['download/%s' % product_name]
                    product.url = product.json['url']
                    
                    # download and allow partial products
                    try:
                        product.web = urllib2.urlopen(product.url, timeout=60)
                        eq['status'] = 'downloaded'
                    except httplib.IncompleteRead as e:
                        product.web = e.partial
                        eq['status'] = 'incomplete'
                        
                    product.str_ = product.web.read()
                    product.web.close()
                        
                    product.file_ = open('%s%s%s' % (shakemap.directory_name,
                                                      self.delim,
                                                      product_name), 'wt')
                    product.file_.write(product.str_)
                    product.file_.close()
                except:
                    print 'Failed to download: %s %s' % (eq_id, product_name)
            
            event = session.query(Event).filter(Event.event_id == shakemap.shakemap_id).all()
            if event:
                event = event[0]
                event.shakemaps.append(shakemap)
            session.commit()
            
            new_shakemaps += [shakemap]
            shakemap_str += 'Wrote %s to disk.\n' % eq_id
    
        self.log += shakemap_str
        Session.remove()
        print shakemap_str
        return new_shakemaps, shakemap_str


class Point(object):
    
    '''
    Keeps track of shaking data associated with a location. A list of
    these is made in the SM_Grid class and can be sorted by a metric
    using the SM_Grid.sort_by method
    '''
    
    sort_by = ''
    def __init__(self):
        self.info = {}

    def __cmp__(self, other):
        #if hasattr(other, 'info'):
            #return (int(self.shaking[self.sort_by]).
            #            __cmp__(int(other.shaking[self.sort_by])))

            
        #return (int(self.info[self.sort_by] * 10000).
        #            __cmp__(int(other.info[self.sort_by] * 10000)))
        if int(self.info[self.sort_by] * 10000) > int(other.info[self.sort_by] * 10000):
            return 1
        elif int(self.info[self.sort_by] * 10000) < int(other.info[self.sort_by] * 10000):
            return -1
        else:
            return 0

class SM_Grid(object):
    
    '''
    Object that reads a grid.xml file and compares shaking data with
    input from user data
    '''
    
    def __init__(self,
                 lon_min = 0,
                 lon_max = 0,
                 lat_min = 0,
                 lat_max = 0,
                 nom_lon_spacing = 0,
                 nom_lat_spacing = 0,
                 num_lon = 0,
                 num_lat = 0,
                 event_id = '',
                 magnitude = 0,
                 depth = 0,
                 lat = 0,
                 lon = 0,
                 description = '',
                 directory_name = '',
                 xml_file = ''):
        
        self.lon_min = lon_min
        self.lon_max = lon_max
        self.lat_min = lat_min
        self.lat_max = lat_max
        self.nom_lon_spacing = nom_lon_spacing
        self.nom_lat_spacing = nom_lat_spacing
        self.num_lon = num_lon
        self.num_lat = num_lat
        self.event_id = event_id
        self.magnitude = magnitude
        self.depth = depth
        self.lat = lat
        self.lon = lon
        self.description = description
        self.directory_name = directory_name
        self.xml_file = xml_file
        self.tree = None
        self.fields = []
        self.grid = []
        
        self.points = []
    
    def load(self, file_ = ''):
        """
        Loads data from a specified grid.xml file into the object
        """
        
        if file_ == '':
            file_ = self.xml_file
        else:
            self.xml_file = file_
        
        if file_ == '':
            return False
        
        try:
            self.tree = ET.parse(file_)
            root = self.tree.getroot()
            
            # set the SM_Grid's attributes
            all_atts = {}
            [all_atts.update(child.attrib) for child in root]
            
            self.lat_min = float(all_atts.get('lat_min'))
            self.lat_max = float(all_atts.get('lat_max'))
            self.lon_min = float(all_atts.get('lon_min'))
            self.lon_max = float(all_atts.get('lon_max'))
            self.nom_lon_spacing = float(all_atts.get('nominal_lon_spacing'))
            self.nom_lat_spacing = float(all_atts.get('nominal_lat_spacing'))
            self.num_lon = int(all_atts.get('nlon'))
            self.num_lat = int(all_atts.get('nlat'))
            self.event_id = all_atts.get('event_id')
            self.magnitude = float(all_atts.get('magnitude'))
            self.depth = float(all_atts.get('depth'))
            self.lat = float(all_atts.get('lat'))
            self.lon = float(all_atts.get('lon'))
            self.description = all_atts.get('event_description')
            
            self.sorted_by = ''
            
            self.fields = [child.attrib['name']
                           for child in root
                           if 'grid_field' in child.tag]
            
            grid_str = [child.text
                        for child in root
                        if 'grid_data' in child.tag][0]
            
            #get rid of trailing and leading white space
            grid_str = grid_str.lstrip().rstrip()
            
            # break into point strings
            grid_lst = grid_str.split('\n')
            
            # split points and save them as Point objects
            for point_str in grid_lst:
                point_str = point_str.lstrip().rstrip()
                point_lst = point_str.split(' ')
            
                point = Point()
                for count, field in enumerate(self.fields):
                    point.info[field] = float(point_lst[count])
                        
                self.grid += [point]

        except:
            return False
        
    def sort_grid(self, metric= ''):
        """
        Sorts the grid by a specified metric
        """
        Point.sort_by = metric
        try:
            self.grid = sorted(self.grid)
            self.sorted_by = metric
            return True
        except:
            return False
    
    def in_grid(self, lon_min=0, lon_max=0, lat_min=0, lat_max=0):
        """
        Check if a point is within the boundaries of the grid
        """
        return ((lon_min > self.lon_min and
                    lon_min < self.lon_max and
                    lat_min > self.lat_min and
                    lat_min < self.lat_max) or
                (lon_min > self.lon_min and
                    lon_min < self.lon_max and
                    lat_max > self.lat_min and
                    lat_max < self.lat_max) or
                (lon_max > self.lon_min and
                    lon_max < self.lon_max and
                    lat_min > self.lat_min and
                    lat_min < self.lat_max) or
                (lon_max > self.lon_min and
                    lon_max < self.lon_max and
                    lat_max > self.lat_min and
                    lat_max < self.lat_max))
    
    def max_shaking(self,
                    lon_min=0,
                    lon_max=0,
                    lat_min=0,
                    lat_max=0,
                    metric=None,
                    facility=None):
        
        '''
        Will return a float with the largest shaking in a specified
        region. If no grid points are found within the region, the
        region is made larger until a point is present
        
        Returns:
            int: -1 if max shaking can't be determined, otherwise shaking level
        '''
    
        if facility is not None:
            try:
                lon_min = facility.lon_min
                lon_max = facility.lon_max
                lat_min = facility.lat_min
                lat_max = facility.lat_max
                metric = facility.metric
            except:
                return -1
            
        if not self.grid:
            return None
        
        # check if the facility lies in the grid    
        if not facility.in_grid(self):
            return {facility.metric: 0}
        
        # check if the facility's metric exists in the grid
        if not self.grid[0].info.get(facility.metric, None):
            return {facility.metric: None}
        
        # sort the grid in an attempt to speed up processing on
        # many facilities
        if self.sorted_by != 'LON':
            self.sort_grid('LON')
        
        # figure out where in the point list we should look for shaking
        start = int((lon_min - self.grid[0].info['LON']) / self.nom_lon_spacing) - 1
        end = int((lon_max - self.grid[0].info['LON']) / self.nom_lon_spacing) + 1
        if start < 0:
            start = 0
        
        shaking = []
        while not shaking:
            shaking = [point for point in self.grid[start:end] if
                                        (point.info['LAT'] > lat_min and
                                         point.info['LAT'] < lat_max)]
            
            # make the rectangle we're searching in larger to encompass
            # more points
            lon_min -= .01
            lon_max += .01
            lat_min -= .01
            lat_max += .01
            start -= 1
        
        Point.sort_by = metric
        shaking = sorted(shaking)
        return shaking[-1].info

        
class Mailer(object):
    """
    Keeps track of information used to send emails
    """
    
    def __init__(self):
        # get info from the config
        sc = SC()
        
        self.me = sc.smtp_from
        self.username = sc.smtp_username
        self.password = sc.smtp_password
        self.server_name = sc.smtp_server
        self.server_port = sc.smtp_port
        
    def send(self, msg=None, you=[], debug=False):
        """
        Send an email (msg) to specified addresses (you) using SMTP
        server details associated with the object
        """
        server = smtplib.SMTP(self.server_name, self.server_port) #port 465 or 587
        server.ehlo()
        server.starttls()
        server.ehlo()
        server.login(self.me, self.password)
        
        server.sendmail(self.me, you, msg.as_string())
        server.quit()
        
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
    """
    
    def __init__(self):
        self.timezone = 0
        self.new_eq_mag_cutoff = 0.0
        self.check_new_int = 0
        self.use_geo_json = False
        self.geo_json_web = ''
        self.geo_json_int = 0
        self.archive_mag = 0.0
        self.keep_eq_for = 0
        self.eq_req_products = []
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
    
        self.load()
    
    def load(self):
        """
        Load information from database to the SC object
        
        Returns:
            None
        """
        
        conf_dir = self.get_conf_dir()
        conf_file = open(conf_dir + 'sc.json', 'r')
        conf_str = conf_file.read()
        conf_json = json.loads(conf_str)
        
        # timezone
        self.timezone = conf_json['timezone']
        
        # Services
        self.new_eq_mag_cutoff = conf_json['Services']['new_eq_mag_cutoff']
        self.check_new_int = conf_json['Services']['check_new_int']
        self.use_geo_json = conf_json['Services']['use_geo_json']
        self.geo_json_int = conf_json['Services']['geo_json_int']
        self.archive_mag = conf_json['Services']['archive_mag']
        self.keep_eq_for = conf_json['Services']['keep_eq_for']
        self.geo_json_web = conf_json['Services']['geo_json_web']
        self.eq_req_products = conf_json['Services']['eq_req_products']
        
        # Logging
        self.log_rotate = conf_json['Logging']['log_rotate']
        self.log_file = conf_json['Logging']['log_file']
        self.log_level = conf_json['Logging']['log_level']
        
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
        self.software_version = conf_json['Server']['software_version']
    
    def get_conf_dir(self):
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
        directory = delim.join(path) + delim
        
        return directory
        

class Notification_Builder(object):
    """
    Holds HTML shell for new events as well as notification configuration
    settings for a new event message
    
    Attributes:
        html (str): generated HTML new event notification
        html_shell (str): HTML before it is filled in with info for notification and user specifications
    """
    
    def __init__(self):
        self.html = ''
        self.html_shell_ne = """
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
</head>
<body style="background-color:%s;width:700px">
    <table style="table-layout:fixed;width:100%%">
        <tr>
            <td>
                <table>
                    <tr>
                        <td>
                            <div style="width: 80px">
                                <img style="border-radius:50%%" src="cid:sc_logo">
                            </div>
                        </td>
                        <td>
                            <h1 style="color:#444444;font-size:50px;font-family:Arial;margin:0px">ShakeCast Alert</h1>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr>
            <td>
                <table style="width:95%%;margin-left:2.5%%">
                    <tr>
                        <td>
                            <h2 style="font-family:Arial;color:%s;background-color:%s;padding:10px;margin-top:20px;margin-bottom:5px">Preliminary Earthquake Notification</h2>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr style="background-color:%s">
            <td>
                <table style="width:90%%;margin-left:5%%">
                    <tr>
                        <td>
                            <p style="font-family:Arial;color:%s;margin:0px">%s %s</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        

        <tr style="text-align:center">
            <td>
                <h2 style="color:%s;border-bottom:2px solid %s;width:200px;margin-left:auto;margin-right:auto;font-family:Arial">Earthquake Details</h2>
            </td>
        </tr>
        <tr>
        
            <td>
                <table style="text-align:center;border: 2px solid #444444;border-collapse: collapse;padding: 5px;font-family:Arial; width:100%%">
                    <tbody style="position: relative">
                        <tr style="border: 2px solid #444444">
                            <th style="border: 2px solid #444444;padding: 5px;">Map</th>
                            <th style="border: 2px solid #444444;padding: 5px;">ID</th>
                            <th style="border: 2px solid #444444;padding: 5px;">Time</th>
                            <th style="border: 2px solid #444444;padding: 5px;">Mag</th>
                            <th style="border: 2px solid #444444;padding: 5px;">Lat</th>
                            <th style="border: 2px solid #444444;padding: 5px;">Lon</th>
                            <th style="border: 2px solid #444444;padding: 5px;">Location</th>
                        </tr>
                        <tr>
                            <td style="border: 2px solid #444444">
                                <img src="cid:gmap">
                            </td>
                            <td style="border: 2px solid #444444;padding: 5px;">%s</td>
                            <td style="border: 2px solid #444444;padding: 5px;">%s</td>
                            <td style="border: 2px solid #444444;padding: 5px;">%s</td>
                            <td style="border: 2px solid #444444;padding: 5px;">%s</td>
                            <td style="border: 2px solid #444444;padding: 5px;">%s</td>
                            <td style="border: 2px solid #444444;padding: 5px;">%s</td>
                        </tr>
                        </tbody>
                </table>
            </td>
        </tr>
        <tr>
            <td>
                <h3 style="color:%s;font-family:Arial;margin-top:50px;margin-bottom:0px">ShakeCast Server:</h3>
            </td>
        </tr>
        
        <tr>
            <td>
                <table style="color:%s;margin-left:10px">
                    <tr>
                        <td>
                            <p style="margin-bottom:2px;margin-top:0px;font-size: small;font-family: Arial;">ShakeCast Web: <a href="%s" target="_blank">%s</a></p>
                            <p style="margin-bottom:2px;margin-top:0px;font-size: small;font-family: Arial;">Software: %s</p>
                            <p style="margin-bottom:2px;margin-top:0px;font-size: small;font-family: Arial;">Notification Generated: %s</p>
                            <p style="margin-bottom:2px;margin-top:0px;font-size: small;font-family: Arial;">Reported by: %s</p>
                            <p style="margin-bottom:2px;margin-top:0px;font-size: small;font-family: Arial;">Template Type: %s</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr>
            <td>
                <p style="font-size: medium;font-family: Arial;">Questions about ShakeCast?  Contact Administrator at <a href="mailto:%s?subject=ShakeCast+V3+Inquiry" target="_blank">%s</a>.</p> 
            </td>
        </tr>

    </table>

</body>
</html>
"""
        self.html_shell_insp = """
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
</head>
<body style="background-color:{0};width:700px">
    <table style="table-layout:fixed;width:100%;font-family:Arial">
        <tr>
            <td>
                <table>
                    <tr>
                        <td>
                            <div style="width: 80px">
                                <img src="cid:sc_logo" style="border-radius: 50%">
                            </div>
                        </td>
                        <td>
                            <h1 style="color:#444444;font-size:50px;font-family:Arial;margin:0px">ShakeCast Alert</h1>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr>
            <td>
                <table style="width:95%;margin-left:2.5%;">
                    <tr>
                        <td>
                            <h2 style="font-family:Arial;color:{1};background-color:{2};padding:10px;margin-top:20px;margin-bottom:5px;width:100%">Inspection Notification</h2>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr>
            <td>
                <table style="width:90%;margin-left:5%;font-family:Arial;color:#444444;font-weight:bold">
                    <tr>
                        <td>
                            <h2 style="background-color:#ffffff;margin-top:20px;margin-bottom:0px">Magnitude {3}</h2>
                            <h2 style="background-color:#ffffff;margin-top:5px;margin-bottom:5px;border-bottom:2px solid #444444">{4}</h2>
                            <table>
                                <tr>
                                    <td>Number of Facilities Evaluated</td>
                                    <td>: {5}</td>
                                </tr>
                                <tr>
                                    <td style="color:red">High Impact</td>
                                    <td>: {6}</td>
                                </tr>
                                <tr>
                                    <td style="color:orange">Moderate-High Impact</td>
                                    <td>: {7}</td>
                                </tr>
                                <tr>
                                    <td style="color:gold">Moderate Impact</td>
                                    <td>: {8}</td>
                                </tr>
                                <tr>
                                    <td style="color:green">Low Impact</td>
                                    <td>: {9}</td>
                                </tr>
                                <tr>
                                    <td style="color:grey">No Impact</td>
                                    <td>: {10}</td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        
        <tr>
            <td style="text-align:center;padding-top:20px">
                <img src="cid:shakemap">
            </td>
        </tr>
        
        <tr>
            <td>
                <h2 style="color:#444444;margin-top:20px;margin-bottom:15px;border-bottom:2px solid #444444;margin-left:2.5%;width:90%">Impact Estimates:</h2>
            </td>
        </tr>
        
        <tr>
            <td>
                <table style="text-align:center;border: 2px solid #444444;border-collapse:collapse;padding:5px;margin-left:5%">
                    <tr>
                        <th style="border: 2px solid #444444;padding: 5px;">Facility</th>
                        <th style="border: 2px solid #444444;padding: 5px;">Inspection Priority</th>
                        <th style="border: 2px solid #444444;padding: 5px;">Metric</th>
                        <th style="border: 2px solid #444444;padding: 5px;">Value</th>
                    </tr>
                    {11}
                </table>
            </td>
        </tr>
        
        <tr>
            <td>
                <h3 style="color:{12};font-family:Arial;margin-top:50px;margin-bottom:0px">ShakeCast Server:</h3>
            </td>
        </tr>
        
        <tr>
            <td>
                <table style="color:{13};margin-left:10px">
                    <tr>
                        <td>
                            <p style="margin-bottom:2px;margin-top:0px;font-size: small;font-family: Arial;">ShakeCast Web: <a href="{14}" target="_blank">{14}</a></p>
                            <p style="margin-bottom:2px;margin-top:0px;font-size: small;font-family: Arial;">Software: {15}</p>
                            <p style="margin-bottom:2px;margin-top:0px;font-size: small;font-family: Arial;">Notification Generated: {16}</p>
                            <p style="margin-bottom:2px;margin-top:0px;font-size: small;font-family: Arial;">Reported by: {17}</p>
                            <p style="margin-bottom:2px;margin-top:0px;font-size: small;font-family: Arial;">Template Type: {18}</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr>
            <td>
                <p style="font-size: medium;font-family: Arial;">Questions about ShakeCast?  Contact Administrator at <a href="mailto:{19}?subject=ShakeCast+V3+Inquiry" target="_blank">{19}</a>.</p> 
            </td>
        </tr>

    </table>

</body>
</html>
"""

    def buildNewEventHTML(self, event):
        """
        Builds the HTML notification using the html_shell.
        
        Args:
            event (Event): Event object for the notification being created
        """
        sc = SC()
        temp_dir = self.get_temp_dir()  + 'new_event' + get_delim()
        temp_file = open(temp_dir + sc.default_template_new_event, 'r')
        temp_str = temp_file.read()
        temp_json = json.loads(temp_str)

        sc_link = temp_json['intro']['sc_link'] % sc.server_dns
        
        self.html = self.html_shell_ne % (
            temp_json['body_color'],
            temp_json['section_head']['font_color'],
            temp_json['section_head']['back_color'],
            temp_json['intro']['back_color'],
            temp_json['intro']['font_color'],
            temp_json['intro']['text'], sc_link,
            temp_json['second_head']['font_color'],
            temp_json['second_head']['border_color'],
            event.event_id,
            event.time,
            event.magnitude,
            event.lat,
            event.lon,
            event.place,
            temp_json['footer']['header_color'],
            temp_json['footer']['font_color'],
            sc.server_dns, sc.server_dns,
            sc.software_version,
            '',
            sc.server_name,
            '',
            temp_json['admin_email'], temp_json['admin_email']
        )
        
    def buildInspHTML(self, shakemap):
        """
        Builds the HTML notification using the html_shell_insp.
        
        Args:
            shakemap (ShakeMap): ShakeMap object for the notification being created
        """
        
        sc = SC()
        temp_dir = self.get_temp_dir()  + 'inspection' + get_delim()
        temp_file = open(temp_dir + sc.default_template_inspection, 'r')
        temp_str = temp_file.read()
        temp_json = json.loads(temp_str)
        
        # make facility string
        stmt = (select([Facility.__table__.c.facility_id,
                       Facility.__table__.c.name,
                       Facility.__table__.c.facility_type,
                       Facility_Shaking.__table__.c.alert_level,
                       Facility_Shaking.__table__.c.metric
                       ]).where(and_(Facility_Shaking.__table__.c.facility_id ==
                                        Facility.__table__.c.shakecast_id,
                                        Facility_Shaking.__table__.c.shakemap_id ==
                                        shakemap.shakecast_id))
                         .order_by(desc('weight')))
        result = engine.execute(stmt)
        fac_row = """        
                    <tr>
                        <td style="border: 2px solid #444444;padding: 5px;">{0}</td>
                        <td style="border: 2px solid #444444;padding: 5px;background-color:{1}">{2}</td>
                        <td style="border: 2px solid #444444;padding: 5px;">{3}</td>
                        <td style="border: 2px solid #444444;padding: 5px;">{3}</td>
                    </tr>
"""
        fac_str = ''
        grey_count = 0
        green_count = 0
        yellow_count = 0
        orange_count = 0
        red_count = 0
        for row in result:
            if row[3] == 'green':
                color = '#44dd66'
                green_count += 1
                impact = 'Low'
            elif row[3] == 'yellow':
                color = 'yellow'
                impact = 'Moderate'
                yellow_count += 1
            elif row[3] == 'orange':
                color = 'orange'
                impact = 'Moderate - High'
                orange_count += 1
            elif row[3] == 'red':
                color = '#ff4444'
                red_count += 1
                impact = 'High'
            else:
                color = '#dddddd'
                grey_count += 1
                impact = 'None'
                
            fac_str += fac_row.format(row[1], color, impact, row[4], row[4])
            
        result.close()
        
        self.html = self.html_shell_insp.format(
            temp_json['body_color'],
            temp_json['section_head']['font_color'],
            temp_json['section_head']['back_color'],
            shakemap.event.magnitude,
            shakemap.event.place,
            str(grey_count + green_count + yellow_count + orange_count + red_count),
            red_count,
            orange_count,
            yellow_count,
            green_count,
            grey_count,
            fac_str,
            temp_json['footer']['header_color'],
            temp_json['footer']['font_color'],
            sc.server_dns,
            sc.software_version,
            '',
            sc.server_name,
            '',
            temp_json['admin_email']
        )
    
    def get_temp_dir(self):
        """
        Determine where the template directory is
        
        Returns:
            string: The absolute path the the template directory
        """
        
        # Get directory location for database
        path = os.path.dirname(os.path.abspath(__file__))
        delim = get_delim()
        path = path.split(delim)
        path[-1] = 'templates'
        directory = delim.join(path) + delim
        
        return directory