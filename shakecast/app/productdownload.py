import datetime
import json
import os
import time

from .urlopener import URLOpener
from .grid import ShakeMapGrid
from .orm import Event, Group, Product, ShakeMap, dbconnect
from .util import SC


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
        self.shakemaps = {}
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
            json_str = url_opener.open(
                self.json_feed_url.format(self.query_period))
        else:
            json_str = url_opener.open(self.json_feed_url)
        self.json_feed = json.loads(json_str)
        self.read_json_feed()

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
                    if eq['id'] not in list(self.earthquakes.keys()):
                        self.earthquakes[eq['id']] = eq
                except Exception:
                    continue
        return

    @dbconnect
    def get_new_events(self, session=None, scenario=False):
        """
        Checks the json feed for new earthquakes
        """
        sc = SC()

        event_str = ''
        new_events = []
        for eq_id in list(self.earthquakes.keys()):
            eq = self.earthquakes[eq_id]

            # ignore info from unfavorable networks and low mag eqs
            if (eq['properties']['net'] in self.ignore_nets or
                    eq['properties']['mag'] < sc.new_eq_mag_cutoff):
                continue

            # get event id and all ids
            event_id = eq_id if not scenario else eq_id + '_scenario'
            event = Event(event_id=event_id, save=True)


            event.updated = eq['properties']['updated']
            event.all_event_ids = eq['properties']['ids'] if not scenario else event.event_id

            # use id and all ids to determine if the event is new and
            # query the old event if necessary
            old_shakemaps = []
            old_notifications = []
            if event.is_new() is False:
                event.status = 'processed'
                ids = event.all_event_ids.strip(',').split(',')
                old_events = [(session.query(Event)
                    .filter(Event.event_id == each_id).first())
                    for each_id in ids]

                reprocess = False
                for old_event in old_events:
                    if old_event and old_event.updated and eq['properties']['updated'] >= old_event.updated:
                        reprocess = True

                if reprocess is True:
                    for old_event in old_events:
                        if old_event is not None:
                            old_notifications += old_event.notifications
                            old_shakemaps += old_event.shakemaps

                            # if one of these old events hasn't had
                            # notifications sent, this event should be sent
                            if old_event.status == 'new':
                                event.status = 'new'
                            session.delete(old_event)

                            if eq['properties'].get('mmi'):
                              self.shakemaps[eq_id] = eq
                else:
                    continue
            else:
                event.status = 'new'

                if eq['properties'].get('mmi'):
                  self.shakemaps[eq_id] = eq

            # Fill the rest of the event info
            event.title = eq['properties']['title']
            event.place = eq['properties']['place']
            event.time = eq['properties']['time']/1000.0
            event.magnitude = eq['properties']['mag']
            event_coords = eq['geometry']['coordinates']
            event.lon = event_coords[0]
            event.lat = event_coords[1]
            event.depth = event_coords[2]
            event.type = 'scenario' if scenario is True else 'event'
            event.updated = eq['properties']['updated']

            # determine whether or not an event should be kept
            # based on group definitions. Should always be true for scenario runs
            keep_event = scenario
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

        # print event_str
        return new_events, event_str

    @staticmethod
    def get_event_map(event):
        image_loc = os.path.join(event.directory_name,
                                 'image.png')

        if os.path.exists(image_loc) is False:
            sc = SC()
            # download the google maps image
            url_opener = URLOpener()
            gmap = url_opener.open(
                    'https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-s+F00(%s,%s)/%s,%s,5/200x200?access_token=%s' % (event.lon,
                    event.lat,
                    event.lon,
                    event.lat,
                    sc.map_key))
            # and save it
            image = open(image_loc, 'wb')
            image.write(gmap)
            image.close()

    @dbconnect
    def get_new_shakemaps(self, session=None, scenario=False):
        """
        Checks the json feed for new earthquakes
        """
        url_opener = URLOpener()

        shakemap_str = ''
        new_shakemaps = []
        for eq_id in list(self.shakemaps.keys()):
            eq = self.shakemaps[eq_id]

            if scenario is False:
                eq_url = eq['properties']['detail']

                try:
                    eq_str = url_opener.open(eq_url)
                except Exception as e:
                    self.log += 'Bad EQ URL: {0}'.format(eq_id)
                    continue

                try:
                    eq_info = json.loads(eq_str)
                except Exception as e:
                    self.log += 'Invalid JSON: {0}'.format(eq_id)
                    continue
            else:
                eq_info = eq

            # check if the event has a shakemap
            if ('shakemap' not in list(eq_info['properties']['products'].keys()) and
                    'shakemap-scenario' not in list(eq_info['properties']['products'].keys())):
                continue

            # check for downloaded event whose id or one of its old ids
            # matches the shakemap id
            if scenario is False:
                event = session.query(Event).filter(
                    Event.all_event_ids.contains(eq_id)).first()
            else:
                eq_id += '_scenario'
                event = session.query(Event).filter(
                    Event.event_id == eq_id).first()

            # skips maps for events that weren't downloaded
            if event is None:
                continue

            if 'shakemap-scenario' in list(eq_info['properties']['products'].keys()):
                sm_str = 'shakemap-scenario'
            else:
                sm_str = 'shakemap'

            # which shakemap has the highest weight
            weight = 0
            for idx in range(len(eq_info['properties']['products'][sm_str])):
                if eq_info['properties']['products'][sm_str][idx]['preferredWeight'] > weight:
                    weight = eq_info['properties']['products'][sm_str][idx]['preferredWeight']
                    shakemap_json = eq_info['properties']['products'][sm_str][idx]

            # grab an existing shakemap
            shakemap_version = shakemap_json['properties']['version']
            shakemap = (session.query(ShakeMap)
                        .filter(ShakeMap.shakemap_id == eq_id)
                        .filter(ShakeMap.shakemap_version == shakemap_version)
                        .first())

            if shakemap is None:
                # create a new shakemap
                shakemap = ShakeMap(
                    shakemap_id=eq_id,
                    shakemap_version=shakemap_version,
                    event=event,
                    save=True
                )

            # Check for new shakemaps without statuses; get them a
            # status so we know what to do with them later
            if shakemap.status is None:
                shakemap.status = 'downloading'
            session.add(shakemap)
            session.commit()

            # depricate previous unprocessed versions of the ShakeMap
            dep_shakemaps = (
                session.query(ShakeMap)
                .filter(ShakeMap.shakemap_id == shakemap.shakemap_id)
                .filter(ShakeMap.status == 'new')
                .filter(ShakeMap.shakemap_version <= shakemap.shakemap_version)).all()
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
            shakemap.type = 'scenario' if scenario is True else 'event'

            # Try to download all prefered products
            for product_name in self.pref_products:
                # if we already have a good version of this product
                # just skip it
                if shakemap.has_products([product_name]):
                    continue

                product = (session.query(Product)
                           .filter(Product.shakemap_id == shakemap.shakecast_id)
                           .filter(Product.product_type == product_name)).first()

                if product is None:
                    product = Product(shakemap=shakemap,
                                      product_type=product_name)

                try:
                    product_file_name = os.path.join(
                        shakemap.directory_name,
                        product_name)

                    # Download product if it doesn't exist
                    if not os.path.isfile(product_file_name):
                        product.json = shakemap_json['contents']['download/%s' %
                                                                 product_name]
                        product.url = product.json['url']

                        # download and allow partial products
                        product_download = url_opener.open(product.url)

                        # determine if we're writing binary or not
                        if product_name.lower().endswith(('.png', '.jpg', '.jpeg')):
                            mode = 'wb'
                        else:
                            mode = 'wt'
                            product_download = product_download.decode()

                        with open(product_file_name, mode) as file_:
                            file_.write(product_download)

                    # the product either already exists or is
                    product.error = None
                    product.status = 'downloaded'
                except Exception as e:
                    product.status = 'download failed'
                    product.error = '{}: {}'.format(type(e), e)
                    self.log += 'Failed to download: %s %s' % (
                        eq_id, product_name)

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
        return new_shakemaps, shakemap_str

    @dbconnect
    def make_heartbeat(self, session=None):
        '''
        Make an Event row that will only trigger a notification for
        groups with a heartbeat group specification
        '''
        last_hb = session.query(Event).filter(
            Event.event_id == 'heartbeat').all()
        make_hb = False
        if last_hb:
            if time.time() > (last_hb[-1].time) + 24*60*60:
                make_hb = True
        else:
            make_hb = True

        if make_hb is True:
            e = Event(event_id='heartbeat', save=True)
            e.time = time.time()
            e.magnitude = 10
            e.lat = 0
            e.lon = 0
            e.title = 'ShakeCast Heartbeat'
            e.place = 'ShakeCast is running'
            e.status = 'new'
            e.type = 'heartbeat'

            session.add(e)
            session.commit()

            self.get_event_map(e)

    def get_scenario(self, shakemap_id='', scenario=False):
        '''
        Grab a shakemap from the USGS web and stick it in the db so
        it can be run as a scenario
        '''
        scenario_ready = True
        try:
            if scenario is True:
                self.json_feed_url = 'https://earthquake.usgs.gov/fdsnws/scenario/1/query?format=geojson&eventid={0}'.format(
                    shakemap_id)
            else:
                self.json_feed_url = 'https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&eventid={0}'.format(
                    shakemap_id)

            self.get_json_feed(scenario=True)
            self.get_new_events(scenario=True)
            self.get_new_shakemaps(scenario=True)
        except Exception:
            scenario_ready = False

        return scenario_ready


@dbconnect
def grab_from_directory(directory, session=None):
    """
    Import an event and shakemap from a local directory

    There are no naming convensions for the directory, but it must
    contain an info.json and grid.xml shakemap product. Event and
    ShakeMap database entries will be created as Scenario products
    and the event can be triggered through the UI as a scenario
    """
    info_loc = os.path.join(directory, 'info.json')

    error = ''
    log = ''
    try:
        with open(info_loc, 'r') as info_file:
            info = json.loads(info_file.read())

        # Load shakemap grid to get extra info
        grid_loc = os.path.join(directory, 'grid.xml')
        grid = ShakeMapGrid()
        grid.load(grid_loc)

    except Exception as e:
        error = str(e)
        log = error
        raise(e)

    event_info = info['input']['event_information']

    # make timestamp
    try:
        dt = datetime.datetime.strptime(
            event_info['origin_time'],
            '%Y-%d-%mT%H:%M:%SZ'
        )
        timestamp = time.mktime(dt.timetuple())
    except Exception:
        # can't parse the timestamp... just use current time
        timestamp = time.time()

    event = Event(
        status='scenario',
        event_id=grid.event_id,
        title='M {} - {}'.format(event_info['magnitude'],
                                 event_info['location']),
        place=event_info['location'],
        time=timestamp,
        magnitude=event_info['magnitude'],
        lon=event_info['longitude'],
        lat=event_info['latitude'],
        depth=event_info['depth'],
        override_directory=directory,
        type='scenario',
        save=True
    )

    session.add(event)

    proc = info['processing']
    shakemap = ShakeMap(
        status='scenario',
        event=event,
        shakemap_id=grid.event_id,
        lat_min=grid.lat_min,
        lat_max=grid.lat_max,
        lon_min=grid.lon_min,
        lon_max=grid.lon_max,
        generation_timestamp=proc['shakemap_versions']['process_time'],
        recieve_timestamp=time.time(),
        override_directory=directory,
        shakemap_version=proc['shakemap_versions']['map_version'],
        type='scenario',
        save=True
    )

    session.add(shakemap)
    session.commit()

    return event, shakemap


def geo_json(query_period='day'):
    '''Get earthquake feed from USGS and check for new earthquakes
    Gets new earthquakes from the JSON feed and logs them in the DB
    Returns:
        dict: a dictionary that contains information about the function run
        ::
            data = {'status': either 'finished' or 'failed',
                    'message': message to be returned to the UI,
                    'log': message to be added to ShakeCast log
                           and should contain info on error}
    '''
    error = ''
    log_message = ''
    status = 'failed'
    new_events = []
    new_shakemaps = []
    try:
        pg = ProductGrabber()
        pg.query_period = query_period
        pg.get_json_feed()
        new_events, log_message = pg.get_new_events()
        new_shakemaps, log_message = pg.get_new_shakemaps()
        pg.make_heartbeat()
        status = 'finished'
    except Exception as e:
        log_message = 'Failed to download ShakeMap products: Check internet connection and firewall settings'
        error = str(e)
        log_message += '\nError: %s' % error

    log_message = pg.log

    data = {'status': status,
            'message': 'Check for new earthquakes',
            'log': log_message,
            'error': error,
            'new_events': len(new_events),
            'new_shakemaps': len(new_shakemaps)}

    return data


def download_scenario(shakemap_id=None, scenario=False):
    message = ''
    success = False
    try:
        if shakemap_id is not None:
            pg = ProductGrabber()
            success = pg.get_scenario(
                shakemap_id=shakemap_id, scenario=scenario)
            if success is True:
                status = 'finished'
                message = 'Downloaded scenario: ' + shakemap_id
                success = True
            else:
                status = 'failed'
                message = 'Failed scenario download: ' + shakemap_id
                success = False
    except Exception as e:
        message = str(e)

    return {'status': status,
            'message': {'from': 'scenario_download',
                        'title': 'Scenario Download Finished',
                        'message': message,
                        'success': success},
            'log': 'Download scenario: ' + shakemap_id + ', ' + status}
