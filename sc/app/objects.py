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
from util import *
import socks
import types
from orm import Event, ShakeMap, Product, User, DeclarativeMeta, Group, SC, dbconnect
from notifications import NotificationBuilder, Mailer
modules_dir = os.path.join(sc_dir(), 'modules')
if modules_dir not in sys.path:
    sys.path += [modules_dir]
    
class Point(dict):
    
    '''
    Keeps track of shaking data associated with a location. A list of
    these is made in the ShakeMapGrid class and can be sorted by a metric
    using the ShakeMapGrid.sort_by method
    '''
    
    sort_by = ''

    def __cmp__(self, other):
        if int(self[self.sort_by] * 10000) > int(other[self.sort_by] * 10000):
            return 1
        elif int(self[self.sort_by] * 10000) < int(other[self.sort_by] * 10000):
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
        for child in root:
            all_atts.update(child.attrib)
        
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
                point[field] = float(point_lst[count])
                    
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
        if not self.grid[0].get(facility.metric, None):
            return {facility.metric: None}
        
        # sort the grid in an attempt to speed up processing on
        # many facilities
        if self.sorted_by != 'LON':
            self.sort_grid('LON')
        
        # figure out where in the point list we should look for shaking
        in_each = len(self.grid) / self.num_lon
        start = int((lon_min - self.grid[0]['LON']) / self.nom_lon_spacing * in_each)
        end = int((lon_max - self.grid[0]['LON']) / self.nom_lon_spacing * in_each)
        if start < 0:
            start = 0
        
        shaking = []
        while not shaking:
            shaking = [point for point in self.grid[start:end] if
                                        (point['LAT'] > lat_min and
                                         point['LAT'] < lat_max)]
            
            # make the rectangle we're searching in larger to encompass
            # more points
            lon_min -= .01
            lon_max += .01
            lat_min -= .01
            lat_max += .01
            start -= 1
        
        Point.sort_by = metric
        shaking = sorted(shaking)
        return shaking[-1]

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
