"""
This program holds all the non-database objects used necessary for
ShakeCast to run. These objects are used in the functions.py program
"""
try:
    import urllib2
except:
    import urllib.request as urllib2

import ssl
import json
import os
import sys
import time
import xml.etree.ElementTree as ET
import smtplib
import datetime
from email.mime.text import MIMEText
from email.mime.image import MIMEImage
from email.mime.multipart import MIMEMultipart
from util import *
from jinja2 import Template
import socks
import types
from orm import Session, Event, ShakeMap, Product, User, DeclarativeMeta, Group, SC
modules_dir = os.path.join(sc_dir(), 'modules')
if modules_dir not in sys.path:
    sys.path += [modules_dir]

class ProductGrabber(object):
    
    """
    Able to access the USGS web, download products, and make entries
    in the database
    """
    
    def __init__(self,
                 req_products=None,
                 data_dir=''):
        
        sc = SC()
        
        self.req_products = req_products
        self.pref_products = []
        self.server_address = ''
        self.json_feed_url = sc.geo_json_web
        self.ignore_nets = sc.ignore_nets.split(',')
        self.json_feed = ''
        self.earthquakes = {}
        self.data_dir = ''
        self.delim = ''
        self.log = ''
        self.query_period = 'day'
        
        if not self.req_products:
            self.req_products = sc.eq_req_products

        if not self.pref_products:
            self.pref_products = sc.dict['Services']['eq_pref_products']
        
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
        self.data_dir = os.path.normpath(self.delim.join(path))
        
    def get_json_feed(self, scenario=False):
        """
        Pulls json feed from USGS web and sets the self.json_feed
        variable. Also makes a list of the earthquakes' IDs
        """
        url_opener = URLOpener()
        if scenario is False:
            json_str = url_opener.open(self.json_feed_url.format(self.query_period))
        else:
            json_str = url_opener.open(self.json_feed_url)
        self.json_feed = json.loads(json_str)

    def read_json_feed(self):
        """
        Reads a list of events from the downloaded json feed
        and caches them in self.earthquakes by id
        """

        # Check for results with a single event
        if self.json_feed.get('features', None) is None:
            eq = self.json_feed
            self.earthquakes[eq['id']] = eq
        
        else:
            for eq in self.json_feed['features']:
                # skip earthquakes without dictionaries... why does this
                # happen??
                try:
                    if eq['id'] not in self.earthquakes.keys():
                        self.earthquakes[eq['id']] = eq
                except Exception:
                    continue
        return
        
    def get_new_events(self, scenario=False):
        """
        Checks the json feed for new earthquakes
        """
        session = Session()
        sc = SC()

        self.read_json_feed()

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
            if scenario is False:
                event.event_id = eq_id
            else:
                event.event_id = eq_id + '_scenario'
                event.all_event_ids = event.event_id
            
            # use id and all ids to determine if the event is new and
            # query the old event if necessary
            old_shakemaps = []
            old_notifications = []
            if event.is_new() is False:
                event.status = 'processed'
                ids = event.all_event_ids.strip(',').split(',')
                old_events = [(session.query(Event)
                                .filter(Event.event_id == each_id)
                                .first())
                                    for each_id in ids]
                
                # remove older events
                for old_event in old_events:
                    if old_event is not None:
                        old_notifications += old_event.notifications
                        old_shakemaps += old_event.shakemaps
                        
                        # if one of these old events hasn't had
                        # notifications sent, this event should be sent
                        if old_event.status == 'new':
                            event.status = 'new'
                        session.delete(old_event)
            else:
                event.status = 'new'

            # over ride new status if scenario
            if scenario is True:
                event.status = 'scenario'
                        
            # Fill the rest of the event info
            event.directory_name = os.path.join(self.data_dir,
                                                event.event_id)
            event.title = self.earthquakes[eq_id]['properties']['title']
            event.place = self.earthquakes[eq_id]['properties']['place']
            event.time = self.earthquakes[eq_id]['properties']['time']/1000.0
            event.magnitude = eq['properties']['mag']
            event_coords = self.earthquakes[eq_id]['geometry']['coordinates']
            event.lon = event_coords[0]
            event.lat = event_coords[1]
            event.depth = event_coords[2]
            
            # determine whether or not an event should be kept
            # based on group definitions
            keep_event = False
            groups = session.query(Group).all()
            if len(groups) > 0:
                for group in groups:
                    if group.point_inside(event):
                        keep_event = True
            else:
                keep_event = True
            
            if keep_event is False:
                continue

            if old_shakemaps:
                event.shakemaps = old_shakemaps
            if old_notifications:
                event.notifications = old_notifications

            session.add(event)
            session.commit()
            
            self.get_event_map(event)
            
            # add the event to the return list and add info to the
            # return string
            new_events += [event]
            event_str += 'Event: %s\n' % event.event_id
        
        Session.remove()
        # print event_str
        return new_events, event_str

    @staticmethod
    def get_event_map(event):
        if not os.path.exists(event.directory_name):
                os.makedirs(event.directory_name)

        image_loc = os.path.join(event.directory_name,
                                 'image.png')

        if os.path.exists(image_loc) is False:
            sc=SC()
            # download the google maps image
            url_opener = URLOpener()
            gmap = url_opener.open("https://api.mapbox.com/styles/v1/mapbox/streets-v10/static/pin-s+F00(%s,%s)/%s,%s,5/200x200?access_token=%s" % (event.lon,
                                            event.lat,
                                            event.lon,
                                            event.lat,
                                            sc.map_key))
            # and save it
            image = open(image_loc, 'wb')
            image.write(gmap)
            image.close()
            
    def get_new_shakemaps(self, scenario=False):
        """
        Checks the json feed for new earthquakes
        """
        session = Session()
        url_opener = URLOpener()
        
        shakemap_str = ''
        new_shakemaps = []
        for eq_id in self.earthquakes.keys():
            eq = self.earthquakes[eq_id]
            
            if scenario is False:
                eq_url = eq['properties']['detail']
                try:
                    eq_str = url_opener.open(eq_url)
                except:
                    self.log += 'Bad EQ URL: {0}'.format(eq_id)
                try:
                    eq_info = json.loads(eq_str)
                except Exception as e:
                    eq_info = e.partial
            else:
                eq_info = eq
            
            # check if the event has a shakemap
            if ('shakemap' not in eq_info['properties']['products'].keys() and
                    'shakemap-scenario' not in eq_info['properties']['products'].keys()):
                continue
            
            # pulls the first shakemap associated with the event
            shakemap = ShakeMap()

            if scenario is False:
                shakemap.shakemap_id = eq_id
            else:
                shakemap.shakemap_id = eq_id + '_scenario'

            if 'shakemap-scenario' in eq_info['properties']['products'].keys():
                sm_str = 'shakemap-scenario'
            else:
                sm_str = 'shakemap'

            # which shakemap has the highest weight
            weight = 0
            for idx in range(len(eq_info['properties']['products'][sm_str])):
                if eq_info['properties']['products'][sm_str][idx]['preferredWeight'] > weight:
                    weight = eq_info['properties']['products'][sm_str][idx]['preferredWeight']
                    shakemap_json = eq_info['properties']['products'][sm_str][idx]

            shakemap.shakemap_version = shakemap_json['properties']['version']
            
            # check if we already have the shakemap
            if shakemap.is_new() is False:
                shakemap = (
                  session.query(ShakeMap)
                    .filter(ShakeMap.shakemap_id == shakemap.shakemap_id)
                    .filter(ShakeMap.shakemap_version == shakemap.shakemap_version)
                    .first()
                )
            
            # Check for new shakemaps without statuses; git them a
            # status so we know what to do with them later
            if shakemap.status is None:
                shakemap.status = 'downloading'
            session.add(shakemap)
            session.commit()
            
            # depricate previous unprocessed versions of the ShakeMap
            dep_shakemaps = (
                session.query(ShakeMap)
                    .filter(ShakeMap.shakemap_id == shakemap.shakemap_id)
                    .filter(ShakeMap.status == 'new')).all()
            for dep_shakemap in dep_shakemaps:
                dep_shakemap.status = 'depricated'
            
            # assign relevent information to shakemap
            shakemap.map_status = shakemap_json['properties']['map-status']
            shakemap.region = shakemap_json['properties']['eventsource']
            shakemap.lat_max = shakemap_json['properties']['maximum-latitude']
            shakemap.lat_min = shakemap_json['properties']['minimum-latitude']
            shakemap.lon_max = shakemap_json['properties']['maximum-longitude']
            shakemap.lon_min = shakemap_json['properties']['minimum-longitude']
            shakemap.generation_timestamp = shakemap_json['properties']['process-timestamp']
            shakemap.recieve_timestamp = time.time()
            
            # make a directory for the new event
            shakemap.directory_name = os.path.join(self.data_dir,
                                                   shakemap.shakemap_id,
                                                   shakemap.shakemap_id + '-' + str(shakemap.shakemap_version))
            if not os.path.exists(shakemap.directory_name):
                os.makedirs(shakemap.directory_name)
        
            # Try to download all prefered products
            for product_name in self.pref_products:
                # if we already have a good version of this product
                # just skip it
                if shakemap.has_products([product_name]):
                    continue

                existing_prod = (session.query(Product)
                                    .filter(Product.shakemap_id == shakemap.shakecast_id)
                                    .filter(Product.product_type == product_name)).all()

                if existing_prod:
                    product = existing_prod[0]
                else:
                    product = Product(shakemap = shakemap,
                                        product_type = product_name)
                
                try:
                    product.json = shakemap_json['contents']['download/%s' % product_name]
                    product.url = product.json['url']
                    
                    # download and allow partial products
                    product.str_ = url_opener.open(product.url)
                    
                    # determine if we're writing binary or not
                    if product_name.lower().endswith(('.png', '.jpg', '.jpeg')):
                        mode = 'wb'
                    else:
                        mode = 'wt'

                    product.file_ = open('%s%s%s' % (shakemap.directory_name,
                                                      self.delim,
                                                      product_name), mode)
                    product.file_.write(product.str_)
                    product.file_.close()

                    product.error = None
                    product.status = 'downloaded'
                except Exception as e:
                    product.status = 'download failed'
                    product.error = '{}: {}'.format(type(e), e)
                    self.log += 'Failed to download: %s %s' % (eq_id, product_name)
            
            # check for event whose id or one of its old ids matches the shakemap id
            if scenario is False:
                event = session.query(Event).filter(Event.all_event_ids.contains(shakemap.shakemap_id)).all()
            else:
                event = session.query(Event).filter(Event.event_id == shakemap.shakemap_id).all()

            if event:
                event = event[0]
                event.shakemaps.append(shakemap)

            if (scenario is False and 
                    shakemap.has_products(self.req_products) and 
                    shakemap.status == 'downloading'):
                shakemap.status = 'new'
            elif scenario is True:
                shakemap.status = 'scenario'
                
            session.commit()
            
            new_shakemaps += [shakemap]
            shakemap_str += 'Wrote %s to disk.\n' % shakemap.shakemap_id
        
        self.log += shakemap_str
        Session.remove()
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
            e.lat = 0
            e.lon = 0
            e.title = 'ShakeCast Heartbeat'
            e.place = 'ShakeCast is running'
            e.status = 'new'
            e.directory_name = os.path.join(self.data_dir,
                                               e.event_id)
            session.add(e)
            session.commit()
            
            self.get_event_map(e)
            
        Session.remove()
        
    def get_scenario(self, shakemap_id='', scenario=False):
        '''
        Grab a shakemap from the USGS web and stick it in the db so
        it can be run as a scenario
        '''
        scenario_ready = True
        try:
            if scenario is True:
                self.json_feed_url = 'https://earthquake.usgs.gov/fdsnws/scenario/1/query?format=geojson&eventid={0}'.format(shakemap_id)
            else:
                self.json_feed_url = 'https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&eventid={0}'.format(shakemap_id)
            
            self.get_json_feed(scenario=True)
            self.get_new_events(scenario=True)
            self.get_new_shakemaps(scenario=True)
        except Exception:
            scenario_ready = False
        
        return scenario_ready

    
class Point(object):
    
    '''
    Keeps track of shaking data associated with a location. A list of
    these is made in the ShakeMapGrid class and can be sorted by a metric
    using the ShakeMapGrid.sort_by method
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


class ShakeMapGrid(object):
    
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
        self.tree = ET.parse(file_)
        root = self.tree.getroot()
        
        # set the ShakeMapGrid's attributes
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
        
    def sort_grid(self, metric= ''):
        """
        Sorts the grid by a specified metric
        """
        Point.sort_by = metric
        self.grid = sorted(self.grid)
        self.sorted_by = metric
        return True
    
    def in_grid(self, facility=None, lon_min=0, lon_max=0, lat_min=0, lat_max=0):
        """
        Check if a point is within the boundaries of the grid
        """
        if facility is not None:
            lon_min = facility.lon_min
            lon_max = facility.lon_max
            lat_min = facility.lat_min
            lat_max = facility.lat_max

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
        
        self.me = sc.smtp_username
        self.username = sc.smtp_username
        self.password = sc.smtp_password
        self.server_name = sc.smtp_server
        self.server_port = int(sc.smtp_port)
        self.security = sc.dict['SMTP']['security']
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
        
    def send(self, msg=None, you=None, debug=False):
        """
        Send an email (msg) to specified addresses (you) using SMTP
        server details associated with the object
        """
        server = smtplib.SMTP(self.server_name, self.server_port) #port 587 or 25

        if self.security.lower() == 'tls':
            server.ehlo()
            server.starttls()
            server.ehlo()

        if self.username and self.password:
            server.login(self.username, self.password)
        
        server.sendmail(self.me, you, msg.as_string())
        server.quit()



class NotificationBuilder(object):
    """
    Uses Jinja to build notifications
    """
    def __init__(self):
        pass
    
    @staticmethod
    def build_new_event_html(events=None, notification=None, group=None, name=None, web=False, config=None):
        temp_manager = TemplateManager()
        if not config:
            if name is None and notification is not None:
                config = temp_manager.get_configs('new_event', 
                                                    name=notification.group.template)
            else:
                config = temp_manager.get_configs('new_event', 
                                                    name=name)
        
        if name is None and notification is not None:
            template = temp_manager.get_template('new_event',
                                                name=notification.group.template)
        else:
            template = temp_manager.get_template('new_event',
                                                name=name)
        

        return template.render(events=events,
                               group=group,
                               notification=notification,
                               sc=SC(),
                               config=config,
                               web=web)
    
    @staticmethod
    def build_insp_html(shakemap, name=None, web=False, config=None):
        temp_manager = TemplateManager()
        if not config:
            config = temp_manager.get_configs('inspection', name=name)
        
        template = temp_manager.get_template('inspection', name=name)

        facility_shaking = shakemap.facility_shaking
        if len(facility_shaking) > 0:
            facility_shaking.sort(key=lambda x: x.weight,
                                        reverse=True)

        fac_details = {'all': 0, 'gray': 0, 'green': 0,
                       'yellow': 0, 'orange': 0, 'red': 0}
        
        for fs in facility_shaking:
            fac_details['all'] += 1
            fac_details[fs.alert_level] += 1
        
        return template.render(shakemap=shakemap,
                               facility_shaking=facility_shaking,
                               fac_details=fac_details,
                               sc=SC(),
                               config=config,
                               web=web)

    @staticmethod
    def build_update_html(update_info=None):
        '''
        Builds an update notification using a jinja2 template
        '''
        template_manager = TemplateManager()
        template = template_manager.get_template('system', name='update')

        return template.render(update_info=update_info)


class TemplateManager(object):
    """
    Manages templates and configs for emails
    """

    @staticmethod
    def get_configs(not_type, name=None):
        if name is None:
            temp_name = 'default.json'
        else:
            temp_name = name + '.json'
            conf_file = os.path.join(sc_dir(),
                                    'templates',
                                    not_type,
                                    temp_name)

        try:
            # try to find the template
            conf_str = open(conf_file, 'r')
        except Exception:
            # just get the default template if the supplied one doesn't
            # exist
            conf_file = os.path.join(sc_dir(),
                                    'templates',
                                    not_type,
                                    'default.json')
            conf_str = open(conf_file, 'r')

        config = json.loads(conf_str.read())
        conf_str.close()
        return config

    @staticmethod
    def save_configs(not_type, name, config):
        if isinstance(config, dict):
            conf_file = os.path.join(sc_dir(),
                                    'templates',
                                    not_type,
                                    name + '.json')
            conf_str = open(conf_file, 'w')
            conf_str.write(json.dumps(config, indent=4))
            conf_str.close()
            return config
        else:
            return None

    @staticmethod
    def get_template(not_type, name=None):
        if name is None:
            temp_name = 'default.html'
        else:
            temp_name = name + '.html'
            temp_file = os.path.join(sc_dir(),
                                        'templates',
                                        not_type,
                                        temp_name)

        try:
            temp_str = open(temp_file, 'r')
        except Exception:
            temp_file = os.path.join(sc_dir(),
                                        'templates',
                                        not_type,
                                        'default.html')
            temp_str = open(temp_file, 'r')
        
        template = Template(temp_str.read())
        temp_str.close()
        return template

    @staticmethod
    def get_template_string(not_type, name=None):
        temp_name = 'default.html'
        if name is not None:
            temp_name = name + '.html'

        temp_file = os.path.join(sc_dir(),
                                    'templates',
                                    not_type,
                                    temp_name)
        try:
            temp = open(temp_file, 'r')
            temp_str = temp.read()
            temp.close()
            return temp_str
        except Exception:
            return None

    @staticmethod
    def save_template(not_type, name, template_str):
        temp_file = os.path.join(sc_dir(),
                                'templates',
                                not_type,
                                name + '.html')
        temp_file = open(temp_file, 'w')
        temp_file.write(template_str)
        temp_file.close()
        return temp_file

    @staticmethod
    def get_template_names():
        '''
        Get a list of the existing template names
        '''
        temp_folder = os.path.join(sc_dir(),
                                   'templates',
                                   'new_event')
        file_list = os.listdir(temp_folder)

        # get the names of the templates
        just_names = [f.split('.')[0] for f in file_list if f[-5:] == '.json']
        return just_names
    
    def create_new(self, name):
        event_configs = self.get_configs('new_event', 'default')
        event_temp = self.get_template_string('new_event', 'default')

        insp_configs = self.get_configs('inspection', 'default')
        insp_temp = self.get_template_string('inspection', 'default')

        # save configs
        event_configs_saved = self.save_configs('new_event', name, event_configs)
        insp_configs_saved = self.save_configs('inspection', name, insp_configs)
        
        # save templates
        event_template_saved = self.save_template('new_event', name, event_temp)
        insp_template_saved = self.save_template('inspection', name, insp_temp)

        return bool(None not in [event_configs_saved,
                                    insp_configs_saved,
                                    event_template_saved,
                                    insp_template_saved])

class URLOpener(object):
    """
    Either uses urllib2 standard opener to open a URL or returns an
    opener that can run through a proxy
    """
    
    @staticmethod
    def open(url):
        """
        Args:
            url (str): a string url that will be opened and read by urllib2
            
        Returns:
            str: the string read from the webpage
        """

        # create context to avoid certificate errors
        try:
            ctx = ssl.create_default_context()
            ctx.check_hostname = False
            ctx.verify_mode = ssl.CERT_NONE
        except:
            ctx = None

        try:
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
                    
                    if ctx is not None:
                        url_obj = opener.open(url, timeout=60, context=ctx)
                    else:
                        url_obj = opener.open(url, timeout=60)

                    url_read = url_obj.read()
                    url_obj.close()
                    return url_read
                    
                else:
                    proxy = urllib2.ProxyHandler({'http': 'http://{0}:{1}'.format(sc.proxy_server,sc.proxy_port),
                                                  'https': 'https://{0}:{1}'.format(sc.proxy_server,sc.proxy_port)})
                    opener = urllib2.build_opener(proxy)
                    
                    if ctx is not None:
                        url_obj = opener.open(url, timeout=60, context=ctx)
                    else:
                        url_obj = opener.open(url, timeout=60)
                        
                    url_read = url_obj.read()
                    url_obj.close()
                    return url_read
    
            else:
                if ctx is not None:
                    url_obj = urllib2.urlopen(url, timeout=60, context=ctx)
                else:
                    url_obj = urllib2.urlopen(url, timeout=60)
                    
                url_read = url_obj.read()
                url_obj.close()
                return url_read
        except Exception as e:
            raise Exception('URLOpener Error({}: {}, url: {})'.format(type(e),
                                                             e,
                                                             url))

  
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


class SoftwareUpdater(object):
    '''
    Check against USGS web to determine if pyCast needs to update.
    Notifies admin when updates are required and handles the update
    process.
    '''
    def __init__(self):
        sc = SC()
        self.json_url = sc.dict['Server']['update']['json_url']
        self.current_version = sc.dict['Server']['update']['software_version']
        self.current_update = sc.dict['Server']['update']['update_version']
        self.admin_notified = sc.dict['Server']['update']['admin_notified']
        self.sc_root_dir = root_dir()

    def get_update_info(self):
        """
        Pulls json feed from USGS web with update information
        """
        url_opener = URLOpener()
        json_str = url_opener.open(self.json_url)
        update_list = json.loads(json_str)

        return update_list

    def check_update(self, testing=False):
        '''
        Check the list of updates to see if any of them require 
        attention
        '''
        sc = SC()
        self.current_version = sc.dict['Server']['update']['software_version']

        update_list = self.get_update_info()
        update_required = False
        notify = False
        update_info = set()
        for update in update_list['updates']:
            if self.check_new_update(update['version'], self.current_version) is True:
                update_required = True
                update_info.add(update['info'])

                if self.check_new_update(update['version'], self.current_update) is True:
                    # update current update version in sc.conf json
                    sc = SC()
                    sc.dict['Server']['update']['update_version'] = update['version']

                    if testing is not True:
                        sc.save_dict()
                    notify = True
    
        return update_required, notify, update_info


    @staticmethod
    def check_new_update(new, existing):
        if (('b' in existing and 'b' not in new) or   
                ('b' in existing and 'rc' in new) or
                ('rc' in existing and ('rc' not in new 
                                        and 'b' not in new))):
            return True
        elif (('rc' in existing and 'b' in new) or
                    ('b' not in existing and 'b' in new) or
                    ('rc' not in existing and 'rc' in new)):
            return False

        new_split = new.split('.')
        if 'b' in new_split[-1]:
            new_split = new_split[:-1] + new_split[-1].split('b')
        elif 'rc' in new_split[-1]:
            new_split = new_split[:-1] + new_split[-1].split('rc')

        existing_split = existing.split('.')
        if 'b' in existing_split[-1]:
            existing_split = existing_split[:-1] + existing_split[-1].split('b')
        elif 'rc' in existing_split[-1]:
            existing_split = existing_split[:-1] + existing_split[-1].split('rc')

        if len(existing_split) > len(new_split):
            range_ = len(new_split)
        else:
            range_ = len(existing_split)

        for idx in range(range_):
            if int(new_split[idx]) > int(existing_split[idx]):
                return True        
        return False


    def notify_admin(self, update_info=None, testing=False):
        # notify admin
        admin_notified = False
        admin_notified = self.send_update_notification(update_info=update_info)

        if admin_notified is True:
            # record admin Notification
            sc = SC()
            sc.dict['Server']['update']['admin_notified'] = True
            if testing is not True:
                sc.save_dict()

    def update(self, testing=False):
        update_list = self.get_update_info()
        version = self.current_version
        sc = SC()
        delim = get_delim()
        failed = []
        success = []
        # concatinate files if user is multiple updates behind
        files = self.condense_files(update_list['updates'])
        for file_ in files:
            try:
                # download file
                url_opener = URLOpener()
                text_file = url_opener.open(file_['url'])

                # get the full path to the file
                file_path = delim.join([root_dir()] +
                                    file_['path'].split('/'))
                norm_file_path = os.path.normpath(file_path)

                # open the file
                if 'sc.json' not in file_['path']:
                    # normal text file
                    file_to_update = open(norm_file_path, 'w')
                    file_to_update.write(text_file)
                    file_to_update.close()
                else:
                    # json configs require special update
                    self.update_configs(text_file)

                if self.check_new_update(file_['version'], version):
                    version = file_['version']
                success += [file_]
            except Exception:
                failed += [file_]
        
        sc.dict['Server']['update']['software_version'] = version
        if testing is not True:
            sc.save_dict()

        return success, failed

    @staticmethod
    def update_configs(new):
        """
        Add new configurations, but keep users' changes intact. This will
        have the wrong version number, which will have to be overwritten
        later
        """
        sc = SC()
        new_dict = json.loads(new)

        # map old configs on top of new to retain user settings
        merge_dicts(new_dict, sc.dict)
        sc.dict = new_dict
        sc.save_dict()
        


    def condense_files(self, update_list):
        files = {}
        for update in update_list:
            for file_ in update['files']:
                file_['version'] = update['version']
                if files.get(file_['path'], False) is False:
                    files[file_['path']] = file_
                else:
                    # check if this update is newer
                    if self.check_new_update(file_['version'],
                                                files[file_['path']]['version']):
                        files[file_['path']] = file_
        
        # convert back to list
        file_list = []
        for key in files.keys():
            file_list.append(files[key])

        return file_list

    @staticmethod
    def send_update_notification(update_info=None):
        '''
        Create notification to alert admin of software updates
        '''
        try:
            not_builder = NotificationBuilder()
            html = not_builder.build_update_html(update_info=update_info)

            #initiate message
            msg = MIMEMultipart()
            msg_html = MIMEText(html, 'html')
            msg.attach(msg_html)

            # find the ShakeCast logo
            logo_str = os.path.join(sc_dir(),'view','static','sc_logo.png')
            
            # open logo and attach it to the message
            logo_file = open(logo_str, 'rb')
            msg_image = MIMEImage(logo_file.read())
            logo_file.close()
            msg_image.add_header('Content-ID', '<sc_logo>')
            msg_image.add_header('Content-Disposition', 'inline')
            msg.attach(msg_image)
            
            mailer = Mailer()
            me = mailer.me

            # get admin with emails
            session = Session()
            admin = session.query(User).filter(User.user_type.like('admin')).filter(User.email != '').all()
            emails = [a.email for a in admin]

            msg['Subject'] = 'ShakeCast Software Update'
            msg['To'] = ', '.join(emails)
            msg['From'] = me
            
            if len(emails) > 0:
                mailer.send(msg=msg, you=emails)
        
        except:
            return False

        return True
