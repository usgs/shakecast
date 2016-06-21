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
import datetime
import time
from functions_util import *
from dbi.db_alchemy import *
modules_dir = sc_dir() + 'modules'
if modules_dir not in sys.path:
    sys.path += [modules_dir]
import socks

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
        self.ignore_nets = sc.ignore_nets
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
        self.delim = os.sep
        path = path.split(self.delim)
        path[-1] = 'data'
        self.data_dir = self.delim.join(path) + self.delim
        
    def get_json_feed(self):
        """
        Pulls json feed from USGS web and sets the self.json_feed
        variable. Also makes a list of the earthquakes' IDs
        """
        url_opener = URLOpener()
        json_str = url_opener.open(self.json_feed_url)
        
        self.json_feed = json.loads(json_str)
        
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
            
            # ignore info from unfavorable networks and low mag eqs
            if (eq['properties']['net'] in self.ignore_nets or
                    eq['properties']['mag'] < sc.new_eq_mag_cutoff):
                continue
            
            # get event id and all ids
            event = Event()
            event.all_event_ids = eq['properties']['ids']
            event.magnitude = eq['properties']['mag']
            
            event.directory_name = '%s%s' % (self.data_dir,
                                             eq_id)
            if not os.path.exists(event.directory_name):
                os.makedirs(event.directory_name)
            
            # use id and all ids to determine if the event is new and
            # query the old event if necessary
            old_shakemaps = []
            if event.is_new() is False:
                event.status = 'ignore'
                ids = event.all_event_ids.strip(',').split(',')
                old_events = [(session.query(Event)
                                .filter(Event.event_id == each_id)
                                .first())
                                    for each_id in ids]
                
                # remove older events
                for old_event in old_events:
                    if old_event is not None:
                        old_shakemaps += old_event.shakemaps
                        
                        # if one of these old events hasn't had
                        # notifications sent, this event should be sent
                        if old_event.status == 'new':
                            event.status = 'new'
                        session.delete(old_event)
            else:
                # this is a new event, make a status to match
                event.status = 'new'
                        
            # Fill the rest of the event info
            event.event_id = eq_id
            event.title = self.earthquakes[eq_id]['properties']['title']
            event.place = self.earthquakes[eq_id]['properties']['place']
            event.time = self.earthquakes[eq_id]['properties']['time']/1000.0
            
            event_coords = self.earthquakes[eq_id]['geometry']['coordinates']
            event.lon = event_coords[0]
            event.lat = event_coords[1]
            event.depth = event_coords[2]
            
            if old_shakemaps:
                event.shakemaps = old_shakemaps
            session.add(event)
            session.commit()
            
            # add the event to the return list and add info to the
            # return string
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
        url_opener = URLOpener()
        
        shakemap_str = ''
        new_shakemaps = []
        for eq_id in self.earthquakes.keys():
            eq = self.earthquakes[eq_id]
            
            eq_url = eq['properties']['detail']
            try:
                eq_str = url_opener.open(eq_url)
            except:
                self.log += 'Bad EQ URL: {0}'.format(eq_id)
            try:
                eq_info = json.loads(eq_str)
            except e:
                eq_info = e.partial
            
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
            
            # depricate previous unprocessed versions of the ShakeMap
            dep_shakemaps = (
                session.query(ShakeMap)
                    .filter(ShakeMap.shakemap_id == shakemap.shakemap_id)
                    .filter(ShakeMap.status == 'new')
            )
            for dep_shakemap in dep_shakemaps:
                dep_shakemap.status = 'depricated'
            
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
                        product.str_ = url_opener.open(product.url)
                        eq['status'] = 'downloaded'
                    except httplib.IncompleteRead as e:
                        product.web = e.partial
                        eq['status'] = 'incomplete'
                        
                    product.file_ = open('%s%s%s' % (shakemap.directory_name,
                                                      self.delim,
                                                      product_name), 'wt')
                    product.file_.write(product.str_)
                    product.file_.close()
                except:
                    self.log += 'Failed to download: %s %s' % (eq_id, product_name)
            
            # check for event whose id or one of its old ids matches the shakemap id
            event = session.query(Event).filter(Event.all_event_ids.contains(shakemap.shakemap_id)).all()
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

    def make_heartbeat(self):
        '''
        Make an Event row that will only trigger a notification for
        groups with a heartbeat group_specification
        '''
        session = Session()
        last_hb = session.query(Event).filter(Event.event_id == 'heartbeat').all()
        make_hb = False
        if last_hb:
            if time.time() > (last_hb[-1].time) + 24*60*60:
                make_hb = True
        else:
            make_hb = True
                
        if make_hb is True:
            e = Event()
            e.time = time.time()
            e.event_id = 'heartbeat'
            e.magnitude = 10
            e.lat = 1000
            e.lon = 1000
            e.title = 'ShakeCast Heartbeat'
            e.place = 'ShakeCast is running'
            e.status = 'new'
            session.add(e)
            session.commit()
            
        Session.remove()
        
    def get_scenario(self, eq_id='', region=''):
        '''
        Grab a shakemap from the USGS web and stick it in the db so
        it can be run as a scenario
        '''
        
        # make the event directory and append database
        session = Session()
        shakemap = ShakeMap()
        shakemap.shakemap_id = '{0}{1}'.format(region, eq_id)
        shakemap.shakemap_version = 0
        
        # check if we already have the shakemap
        if shakemap.is_new() is False:
            shakemap = (
              session.query(ShakeMap)
                .filter(ShakeMap.shakemap_id == shakemap.shakemap_id)
                .filter(ShakeMap.shakemap_version == shakemap.shakemap_version)
                .first()
            )
        
        # assign relevent information to shakemap
        shakemap.region = region
        shakemap.recieve_timestamp = time.time()
        shakemap.status = 'scenario'
        
        # make a directory for the new event
        shakemap.directory_name = '{0}{1}{2}{1}-{3}'.format(self.data_dir,
                                                            shakemap.shakemap_id,
                                                            get_delim(),
                                                            shakemap.shakemap_version)
        if not os.path.exists(shakemap.directory_name):
            os.makedirs(shakemap.directory_name)
        
        # download the products
        shakemap_url = 'http://earthquake.usgs.gov/earthquakes/shakemap/{0}/shake/{1}/download/'.format(region,
                                                                                                       eq_id)
        # download products
        for product_name in self.req_products:
            product = Product(product_type = product_name)
            try:
                product.url = '{0}{1}'.format(shakemap_url,
                                              product_name)
                
                # download and allow partial products
                try:
                    url_opener = URLOpener()
                    product.str_ = url_opener.open(product.url)
                except httplib.IncompleteRead as e:
                    self.log += 'Unable to get product for scenario: {0}'.format(product_name)
                    
                product.file_ = open('{0}{1}{2}'.format(shakemap.directory_name,
                                                        self.delim,
                                                        product_name), 'wt')
                product.file_.write(product.str_)
                product.file_.close()
                
                if shakemap.has_products([product_name]):
                    continue
                product.shakemap = shakemap
                
            except:
                print 'Failed to download: %s %s' % (eq_id, product_name)
        
        session.add(shakemap)
        session.commit()
        
        # create event from shakemap's grid.xml
        grid = SM_Grid()
        grid.load(shakemap.directory_name + get_delim() + 'grid.xml')
  
        shakemap.lat_min = grid.lat_min
        shakemap.lat_max = grid.lat_max
        shakemap.lon_min = grid.lon_min
        shakemap.lon_max = grid.lon_max
        
        event = Event()
        event.event_id = shakemap.shakemap_id
        event.all_event_ids = event.event_id
        
        if event.is_new() is False:
            event = session.query(Event).filter(Event.event_id == event.event_id).first()
        
        shakemap.event = event
        event.magnitude = grid.magnitude
        event.depth = grid.depth
        event.directory_name = '{0}{1}'.format(self.data_dir,
                                               event.event_id)
        event.lat = grid.lat
        event.lon = grid.lon
        event.place = grid.description
        event.title = 'M {0} - {1}'.format(event.magnitude, event.place)
        event.time = time.time()
        event.status = 'scenario'
        
        session.commit()
        
        if len(shakemap.products) == len(self.req_products):
            scenario_ready = True
        else:
            scenario_ready = False
        
        Session.remove()
        return scenario_ready

    
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
    
    If a proxy is setup, Mailer will try to wrap the smtplib module
    to access the smtp through the proxy
    """
    
    def __init__(self):
        # get info from the config
        sc = SC()
        
        self.me = sc.smtp_from
        self.username = sc.smtp_username
        self.password = sc.smtp_password
        self.server_name = sc.smtp_server
        self.server_port = sc.smtp_port
        self.log = ''
        
        if sc.use_proxy is True:
            # try to wrap the smtplib library with the socks module
            if sc.proxy_username and sc.proxy_password:
                try:
                    socks.set_default_proxy('socks.PROXY_TYPE_SOCKS4',
                                            sc.proxy_server,
                                            sc.proxy_port,
                                            username=sc.proxy_username,
                                            password=sc.proxy_password)
                    socks.wrap_module(smtplib)
                except:
                    try:
                        socks.set_default_proxy('socks.PROXY_TYPE_SOCKS5',
                                            sc.proxy_server,
                                            sc.proxy_port,
                                            username=sc.proxy_username,
                                            password=sc.proxy_password)
                        socks.wrap_module(smtplib)
                    except:
                        try:
                            socks.set_default_proxy('socks.PROXY_TYPE_SOCKS4',
                                            sc.proxy_server,
                                            sc.proxy_port)
                            socks.wrap_module(smtplib)
                        except:
                            try:
                                socks.set_default_proxy('socks.PROXY_TYPE_SOCKS5',
                                                sc.proxy_server,
                                                sc.proxy_port)
                                socks.wrap_module(smtplib)
                            except:
                                self.log += 'Unable to access SMTP through proxy'
                                
            else:
                try:
                    socks.set_default_proxy('socks.PROXY_TYPE_SOCKS4',
                                    sc.proxy_server,
                                    sc.proxy_port)
                    socks.wrap_module(smtplib)
                except:
                    try:
                        socks.set_default_proxy('socks.PROXY_TYPE_SOCKS5',
                                        sc.proxy_server,
                                        sc.proxy_port)
                        socks.wrap_module(smtplib)
                    except:
                        self.log += 'Unable to access SMTP through proxy'
        
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
                        %s
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
<body style="background-color:{0};width:700px;font-family:Arial">
    <table style="table-layout:fixed;width:100%%">
        <tr>
            <td>
                <table>
                    <tr>
                        <td>
                            <div style="width: 80px">
                                <img style="border-radius:50%" src="cid:sc_logo">
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
                <table style="width:95%;margin-left:2.5%">
                    <tr>
                        <td>
                            <h2 style="font-family:Arial;color:{1};background-color:{2};padding:10px;margin-top:20px;margin-bottom:5px">Inspection Notification</h2>
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
                    {20}
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

    def buildNewEventHTML(self, events=[]):
        """
        Builds the HTML notification using the html_shell.
        
        Args:
            events (list): List of Event objects for the notification being created
        """
        sc = SC()
        temp_dir = self.get_temp_dir()  + 'new_event' + get_delim()
        temp_file = open(temp_dir + sc.default_template_new_event, 'r')
        temp_str = temp_file.read()
        temp_json = json.loads(temp_str)

        sc_link = temp_json['intro']['sc_link'] % sc.server_dns
        
        table_str = ''' <tr>
                            <td style="border: 2px solid #444444">
                                <img src="cid:gmap{0}">
                            </td>
                            <td style="border: 2px solid #444444;padding: 5px;">{1}</td>
                            <td style="border: 2px solid #444444;padding: 5px;">{2}</td>
                            <td style="border: 2px solid #444444;padding: 5px;">{3}</td>
                            <td style="border: 2px solid #444444;padding: 5px;">{4}</td>
                            <td style="border: 2px solid #444444;padding: 5px;">{5}</td>
                            <td style="border: 2px solid #444444;padding: 5px;">{6}</td>
                        </tr>
                '''
        table = ''
        
        clock = Clock()
        for count,event in enumerate(events):
            
            timestamp = (clock.from_time(event.time)
                            .strftime('%Y-%m-%d %H:%M:%S'))
            
            if event.event_id == 'heartbeat':
                magnitude = 'None'
            else:
                magnitude = event.magnitude
            
            table += table_str.format(count,
                                      event.event_id,
                                      timestamp,
                                      magnitude,
                                      event.lat,
                                      event.lon,
                                      event.place)
        
        self.html = self.html_shell_ne % (
            temp_json['body_color'],
            temp_json['section_head']['font_color'],
            temp_json['section_head']['back_color'],
            temp_json['intro']['back_color'],
            temp_json['intro']['font_color'],
            temp_json['intro']['text'], sc_link,
            temp_json['second_head']['font_color'],
            temp_json['second_head']['border_color'],
            table,
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
                       Facility_Shaking.__table__.c.metric,
                       Facility_Shaking.__table__.c.mmi,
                       Facility_Shaking.__table__.c.pga,
                       Facility_Shaking.__table__.c.pgv,
                       Facility_Shaking.__table__.c.psa03,
                       Facility_Shaking.__table__.c.psa10,
                       Facility_Shaking.__table__.c.psa30,
                       ]).where(and_(Facility_Shaking.__table__.c.facility_id ==
                                        Facility.__table__.c.shakecast_id,
                                        Facility_Shaking.__table__.c.shakemap_id ==
                                        shakemap.shakecast_id))
                         .order_by(desc('weight')))
        result = engine.execute(stmt)
        
        
        # load header from template and create html
        head_lst = temp_json['table_head']
        table_header = """
                    <tr>
                        """
        if 'name' in head_lst:
            table_header += '<th style="border: 2px solid #444444;padding: 5px;">Facility</th>'
        if 'facility_id' in head_lst:
            table_header += '<th style="border: 2px solid #444444;padding: 5px;">ID</th>'
        if 'facility_type' in head_lst:
            table_header += '<th style="border: 2px solid #444444;padding: 5px;">Facility_Type</th>'
        if 'inspection_priority' in head_lst:
            table_header += '<th style="border: 2px solid #444444;padding: 5px;">Inspection Priority</th>'
        if 'MMI' in head_lst:
            table_header += '<th style="border: 2px solid #444444;padding: 5px;">MMI</th>'
        if 'PGA' in head_lst:
            table_header += '<th style="border: 2px solid #444444;padding: 5px;">PGA</th>'
        if 'PGV' in head_lst:
            table_header += '<th style="border: 2px solid #444444;padding: 5px;">PGV</th>'
        if 'PSA03' in head_lst:
            table_header += '<th style="border: 2px solid #444444;padding: 5px;">PSA03</th>'
        if 'PSA10' in head_lst:
            table_header += '<th style="border: 2px solid #444444;padding: 5px;">PSA10</th>'
        if 'PSA30' in head_lst:
            table_header += '<th style="border: 2px solid #444444;padding: 5px;">PSA30</th>'
        if 'metric' in head_lst:
            table_header += '<th style="border: 2px solid #444444;padding: 5px;">Metric</th>'
        if 'shaking_value' in head_lst:
            table_header += '<th style="border: 2px solid #444444;padding: 5px;">Shaking Value</th>'

        table_header += """
                    </tr>"""

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
                
            fac_row = """
                    <tr>
                        """
            if 'name' in head_lst:
                fac_row += '<td style="border: 2px solid #444444;padding: 5px;">{1}</td>'
            if 'facility_id' in head_lst:
                fac_row += '<td style="border: 2px solid #444444;padding: 5px;">{0}</td>'
            if 'facility_type' in head_lst:
                fac_row += '<td style="border: 2px solid #444444;padding: 5px;">{2}</td>'
            if 'inspection_priority' in head_lst:
                fac_row += '<td style="border: 2px solid #444444;padding: 5px;background-color:{11}">{12}</td>'
            if 'MMI' in head_lst:
                fac_row += '<td style="border: 2px solid #444444;padding: 5px;">{5}</td>'
            if 'PGA' in head_lst:
                fac_row += '<td style="border: 2px solid #444444;padding: 5px;">{6}</td>'
            if 'PGV' in head_lst:
                fac_row += '<td style="border: 2px solid #444444;padding: 5px;">{7}</td>'
            if 'PSA03' in head_lst:
                fac_row += '<td style="border: 2px solid #444444;padding: 5px;">{8}</td>'
            if 'PSA10' in head_lst:
                fac_row += '<td style="border: 2px solid #444444;padding: 5px;">{9}</td>'
            if 'PSA30' in head_lst:
                fac_row += '<td style="border: 2px solid #444444;padding: 5px;">{10}</td>'
            if 'metric' in head_lst:
                fac_row += '<td style="border: 2px solid #444444;padding: 5px;">{4}</td>'
            if 'shaking_value' in head_lst:
                fac_row += '<td style="border: 2px solid #444444;padding: 5px;">{13}</td>'

            fac_row += """
                        </tr>"""
            
            shaking_dict = {'MMI': row[5],
                            'PGA': row[6],
                            'PGV': row[7],
                            'PSA03': row[8],
                            'PSA10': row[9],
                            'PSA30': row[10]}
            shaking = shaking_dict[row[4]]
            
            fac_str += fac_row.format(row[0], row[1], row[2],
                                        row[3], row[4], row[5],
                                        row[6], row[7], row[8], row[9],
                                        row[10], color, impact, shaking)
            
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
            temp_json['admin_email'],
            table_header
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

    
class URLOpener(object):
    """
    Either uses urllib2 standard opener to open a URL or returns an
    opener that can run through a proxy
    """
    
    def open(self, url):
        """
        Args:
            url (str): a string url that will be opened and read by urllib2
            
        Returns:
            str: the string read from the webpage
        """
        sc = SC()
        if sc.use_proxy is True:
            if sc.proxy_username and sc.proxy_password:
                proxy = urllib2.ProxyHandler({
                            'http': "http://{0}:{1}@{2}:{3}".format(sc.proxy_username,
                                                                    sc.proxy_password,
                                                                    sc.proxy_server,
                                                                    sc.proxy_port),
                            'https': "http://{0}:{1}@{2}:{3}".format(sc.proxy_username,
                                                                     sc.proxy_password,
                                                                     sc.proxy_server,
                                                                     sc.proxy_port)})
                auth = urllib2.HTTPBasicAuthHandler()
                opener = urllib2.build_opener(proxy, auth, urllib2.HTTPHandler)
                
                url_obj = opener.open(url, timeout=60)
                url_read = url_obj.read()
                url_obj.close()
                return url_read
                
            else:
                proxy = urllib2.ProxyHandler({'http': 'http://{0}:{1}'.format(sc.proxy_server,sc.proxy_port),
                                              'https': 'https://{0}:{1}'.format(sc.proxy_server,sc.proxy_port)})
                opener = urllib2.build_opener(proxy)
                
                url_obj = opener.open(url, timeout=60)
                url_read = url_obj.read()
                url_obj.close()
                return url_read

        else:
            url_obj = urllib2.urlopen(url, timeout=60)
            url_read = url_obj.read()
            url_obj.close()
            return url_read
        

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
        if ((hour >= sc.nighttime)
            or hour < sc.morning):
            return True
        else:
            return False
        
    def get_time(self):
        sc = SC()
        self.utc_time = datetime.datetime.utcfromtimestamp(time.time())
        self.app_time = self.utc_time + datetime.timedelta(hours=sc.timezone)
        
    def from_time(self, time):
        sc = SC()
        utc_time = datetime.datetime.utcfromtimestamp(time)
        app_time = utc_time + datetime.timedelta(hours=sc.timezone)
        
        return app_time
  
  
class AlchemyEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj.__class__, DeclarativeMeta):
            # an SQLAlchemy class
            fields = {}
            for field in [x for x in dir(obj) if not x.startswith('_') and x != 'metadata']:
                data = obj.__getattribute__(field)
                try:
                    json.dumps(data) # this will fail on non-encodable values, like other classes
                    fields[field] = data
                except TypeError:
                    try:
                        fields[field] = [str(d) for d in data]
                    except:
                        fields[field] = None
            # a json-encodable dict
            return fields
    
        return json.JSONEncoder.default(self, obj)

