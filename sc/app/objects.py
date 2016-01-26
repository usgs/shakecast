"""
This program holds all the non-database objects used necessary for
ShakeCast to run. These objects are used in the functions.py program
"""

#kMhmsd9g
#shakecast.usgs@gmail.com
#gscodenh01.cr.usgs.gov

import urllib2
import json
import os
import time
import xml.etree.ElementTree as ET
import smtplib
from dbi.db_alchemy import *

class Product_Grabber(object):
    
    """
    Able to access the USGS web, download products, and make entries
    in the database
    """
    
    def __init__(self,
                 req_products=['grid.xml',
                               'stationlist.xml',
                               'intensity.jpg',
                               'info.xml',
                               'ii_overlay.png'],
                 data_dir=''):
        
        self.req_products = req_products
        self.server_address = 'http://earthquake.usgs.gov'
        self.json_feed_url = self.server_address + '/earthquakes/feed/v1.0/summary/1.0_day.geojson'
        self.json_feed = ''
        self.earthquakes = {}
        self.data_dir = ''
        self.delim = ''
        self.log = ''
        
        if data_dir == '':
            self.get_data_path()
    
    def get_data_path(self):
        # get the path to the data folder
        path = os.path.dirname(os.path.abspath(__file__))
        if os.name == 'nt':
            self.delim = '\\'
        else:
            self.delim = '/'
        path = path.split(self.delim)
        path[-1] = 'data'
        self.data_dir = self.delim.join(path) + self.delim
        
    def get_json_feed(self):
        # get json feed
        json_str = urllib2.urlopen(self.json_feed_url)
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
        Local_Session = scoped_session(Session)
        session = Local_Session()
        
        new_shakemaps = []
        for eq_id in self.earthquakes.keys():
            eq = self.earthquakes[eq_id]
            
            eq_url = eq['properties']['detail']
            
            try:
                eq_str = urllib2.urlopen(eq_url)
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
                        .filter(
                            ShakeMap.shakemap_id == shakemap.shakemap_id
                               )
                        .filter(
                            ShakeMap.shakemap_version == shakemap.shakemap_version
                               )
                        .all()[0]
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
            shakemap.directory_name = '%s%s-%s' % (self.data_dir,
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
                        product.web = urllib2.urlopen(product.url)
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
                            
            session.add(shakemap)
            session.commit()
            
            new_shakemaps += [shakemap]
            
            self.log += 'Wrote %s to disk.\n' % eq_id
        
        
        Local_Session.remove()
        print self.log
        return new_shakemaps, self.log


class Point(object):
    
    '''
    Keeps track of shaking data associated with a location. A list of
    these is made in the SM_Grid class and can be sorted by a metric
    specified by sort_by
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
        Point.sort_by = metric
        try:
            self.grid = sorted(self.grid)
            self.sorted_by = metric
            return True
        except:
            return False
    
    def in_grid(self, lon_min=0, lon_max=0, lat_min=0, lat_max=0):
        # check if a point is within the boundaries of the grid
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
        Will return a float with the largest shaking 
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
            
        if not facility.in_grid(self):
            return None
        
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
            #shaking = [point for point in self.grid[start:end] if
            ##                            (point.info['LON'] > lon_min and
            #                             point.info['LON'] < lon_max and
            #                             point.info['LAT'] > lat_min and
            #                             point.info['LAT'] < lat_max)]
            
            shaking = [point for point in self.grid[start:end] if
                                        (point.info['LAT'] > lat_min and
                                         point.info['LAT'] < lat_max)]
            
            lon_min -= .01
            lon_max += .01
            lat_min -= .01
            lat_max += .01
            start -= 1
        
        Point.sort_by = metric
        shaking = sorted(shaking)
        return shaking[-1].info

        
class Mailer(object):
    # kMhmsd9g
    # shakecast.usgs@gmail.com
    # pyCast.USGS@gmail.com
    # USGS!Shake.Cast?V4.0
    
    def __init__(self):
        self.me = 'pyCast.USGS@gmail.com'
        self.password = 'USGS!Shake.Cast?V4.0'
        self.server_name = 'smtp.gmail.com'
        self.server_port = 587
        
    def send(self, msg=None, you=[], debug=False):
        server = smtplib.SMTP(self.server_name, self.server_port) #port 465 or 587
        server.ehlo()
        server.starttls()
        server.ehlo()
        server.login(self.me, self.password)
        
        server.sendmail(self.me, you, msg.as_string())
        server.quit()
    
    
            
    
    
    
    

        
        
        
