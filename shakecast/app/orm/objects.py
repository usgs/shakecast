import base64
from math import floor
import os
import sys
import time
from functools import wraps

from sqlalchemy import case, inspect, MetaData, Column, Integer, String, Float, ForeignKey, Table, select
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.ext.hybrid import hybrid_method, hybrid_property
from sqlalchemy.orm import relationship
from sqlalchemy.sql import and_, or_

from .engine import engine
from .util import IMPACT_RANKS
from ..util import Clock, get_data_dir, get_local_products_dir, sc_dir
from ..impact import get_event_impact, get_impact
from ..jsonencoders import GeoJson, get_geojson_latlon
from ..products import *

# create a metadata object
metadata = MetaData()

# create a bass class. All mapped class will derive from bass class
Base = declarative_base(metadata=metadata)

#######################################################################
########################## Facility Tables ############################
class Facility(Base):
    __tablename__ = 'facility'
    shakecast_id = Column(Integer, primary_key=True)
    facility_id = Column(String(1000))
    facility_type = Column(String(25))
    component = Column(String(100))
    component_class = Column(String(100))
    name = Column(String(255))
    short_name = Column(String(20))
    description = Column(String(255))
    html = Column(String(2000))
    geom_type = Column(String(15))
    lat_min = Column(Float)
    lat_max = Column(Float)
    lon_min = Column(Float)
    lon_max = Column(Float)
    model = Column(String(25))
    gray = Column(Float)
    green = Column(Float)
    yellow = Column(Float)
    orange = Column(Float)
    red = Column(Float)
    gray_beta = Column(Float)
    green_beta = Column(Float)
    yellow_beta = Column(Float)
    orange_beta = Column(Float)
    red_beta = Column(Float)
    gray_metric = Column(String(20))
    green_metric = Column(String(20))
    yellow_metric = Column(String(20))
    orange_metric = Column(String(20))
    red_metric = Column(String(20))
    metric = Column(String(20))
    updated = Column(Integer)
    updated_by = Column(String(32))

    shaking_history = relationship('FacilityShaking',
                                   backref='facility',
                                   cascade='save-update, delete, delete-orphan')

    aebm = relationship('Aebm',
                        backref='facility',
                        uselist=False,
                        cascade='save-update, delete, delete-orphan')

    attributes = relationship('Attribute',
                              backref='facility',
                              cascade='save-update, delete, delete-orphan')

    def __repr__(self):
        return '''Facility(facility_id=%s,
                           facility_type=%s,
                           name=%s,
                           short_name=%s,
                           description=%s,
                           lat_min=%s,
                           lat_max=%s,
                           lon_min=%s,
                           lon_max=%s,
                           gray=%s,
                           green=%s,
                           yellow=%s,
                           orange=%s,
                           red=%s,
                           gray_beta=%s,
                           green_beta=%s,
                           yellow_beta=%s,
                           orange_beta=%s,
                           red_beta=%s,
                           metric=%s)''' % (self.facility_id,
                                            self.facility_type,
                                            self.name,
                                            self.short_name,
                                            self.description,
                                            self.lat_min,
                                            self.lat_max,
                                            self.lon_min,
                                            self.lon_max,
                                            self.gray,
                                            self.green,
                                            self.yellow,
                                            self.orange,
                                            self.red,
                                            self.gray_beta,
                                            self.green_beta,
                                            self.yellow_beta,
                                            self.orange_beta,
                                            self.red_beta,
                                            self.metric)

    def __str__(self):
        return self.name

    def get_attribute(self, name):
        for att in self.attributes:
            if att.name.lower() == name.lower():
                return att.value

        return None

    def make_alert_level(self, shaking_point=None, shakemap=None):
        '''
        Create a dictionary that contains all the information for a
        FacilityShaking entry in the database
        '''
        impact = get_impact(self, shaking_point, shakemap)

        return impact

    @hybrid_property
    def lat(self):
        return (self.lat_max + self.lat_min) / 2

    @hybrid_property
    def lon(self):
        return (self.lon_max + self.lon_min) / 2

    @hybrid_property
    def location(self):
        return '{}, {}'.format(self.lat, self.lon)

    @hybrid_method
    def in_grid(self, grid):
        # check if a point is within the boundaries of the grid
        if self.geom_type != 'POINT':
            return ((self.lon_min > grid.lon_min and
                    self.lon_min < grid.lon_max and
                    self.lat_min > grid.lat_min and
                    self.lat_min < grid.lat_max) or
                    (self.lon_min > grid.lon_min and
                        self.lon_min < grid.lon_max and
                        self.lat_max > grid.lat_min and
                        self.lat_max < grid.lat_max) or
                    (self.lon_max > grid.lon_min and
                        self.lon_max < grid.lon_max and
                        self.lat_min > grid.lat_min and
                        self.lat_min < grid.lat_max) or
                    (self.lon_max > grid.lon_min and
                        self.lon_max < grid.lon_max and
                        self.lat_max > grid.lat_min and
                        self.lat_max < grid.lat_max) or
                    (self.lon_min < grid.lon_min and
                        self.lon_max > grid.lon_min and
                        self.lat_min < grid.lat_min and
                        self.lat_max > grid.lat_min) or
                    (self.lon_min < grid.lon_min and
                        self.lon_max > grid.lon_min and
                        self.lat_min < grid.lat_max and
                        self.lat_max > grid.lat_max) or
                    (self.lon_min < grid.lon_max and
                        self.lon_max > grid.lon_max and
                        self.lat_min < grid.lat_min and
                        self.lat_max > grid.lat_min) or
                    (self.lon_min < grid.lon_min and
                        self.lon_max > grid.lon_max and
                        self.lat_min < grid.lat_min and
                        self.lat_max > grid.lat_max))
        else:
            return (self.lon > grid.lon_min and
                    self.lon < grid.lon_max and
                    self.lat > grid.lat_min and
                    self.lat < grid.lat_max)

    @in_grid.expression
    def in_grid(cls, grid):
        # check if a point is within the boundaries of the grid
        return case([(cls.geom_type != 'POINT',  or_(and_(cls.lon_min > grid.lon_min,
                        cls.lon_min < grid.lon_max,
                        cls.lat_min > grid.lat_min,
                        cls.lat_min < grid.lat_max),
                and_(cls.lon_min > grid.lon_min,
                        cls.lon_min < grid.lon_max,
                        cls.lat_max > grid.lat_min,
                        cls.lat_max < grid.lat_max),
                and_(cls.lon_max > grid.lon_min,
                        cls.lon_max < grid.lon_max,
                        cls.lat_min > grid.lat_min,
                        cls.lat_min < grid.lat_max),
                and_(cls.lon_max > grid.lon_min,
                        cls.lon_max < grid.lon_max,
                        cls.lat_max > grid.lat_min,
                        cls.lat_max < grid.lat_max),
                and_(cls.lon_min < grid.lon_min,
                        cls.lon_max > grid.lon_min,
                        cls.lat_min < grid.lat_min,
                        cls.lat_max > grid.lat_min),
                and_(cls.lon_min < grid.lon_min,
                        cls.lon_max > grid.lon_min,
                        cls.lat_min < grid.lat_max,
                        cls.lat_max > grid.lat_max),
                and_(cls.lon_min < grid.lon_max,
                        cls.lon_max > grid.lon_max,
                        cls.lat_min < grid.lat_min,
                        cls.lat_max > grid.lat_min),
                and_(cls.lon_min < grid.lon_max,
                        cls.lon_max > grid.lon_max,
                        cls.lat_min < grid.lat_max,
                        cls.lat_max > grid.lat_max))),],
        else_ = and_(cls.lon > grid.lon_min,
                        cls.lon < grid.lon_max,
                        cls.lat > grid.lat_min,
                        cls.lat < grid.lat_max)
        )

    @hybrid_property
    def geojson(self):
        geojson = GeoJson()
        geojson['properties'] = {
            'shakecast_id': self.shakecast_id,
            'facility_id': self.facility_id,
            'facility_type': self.facility_type,
            'component': self.component,
            'component_class': self.component_class,
            'name': self.name,
            'short_name': self.short_name,
            'description': self.description,
            'html': self.html,
            'geom_type': self.geom_type,
            'lat_min': self.lat_min,
            'lat_max': self.lat_max,
            'lon_min': self.lon_min,
            'lon_max': self.lon_max,
            'model': self.model,
            'gray': self.gray,
            'green': self.green,
            'yellow': self.yellow,
            'orange': self.orange,
            'red': self.red,
            'gray_beta': self.gray_beta,
            'green_beta': self.green_beta,
            'yellow_beta': self.yellow_beta,
            'orange_beta': self.orange_beta,
            'red_beta': self.red_beta,
            'gray_metric': self.gray_metric,
            'green_metric': self.green_metric,
            'yellow_metric': self.yellow_metric,
            'orange_metric': self.orange_metric,
            'red_metric': self.red_metric,
            'metric': self.metric,
            'updated': self.updated,
            'updated_by': self.updated_by,
            'lat': self.lat,
            'lon': self.lon,
        }

        geojson.set_coordinates(
            get_geojson_latlon(geojson['properties'])
        )

        return geojson


class Attribute(Base):
    __tablename__ = 'attributes'
    shakecast_id = Column(Integer, primary_key=True)
    facility_id = Column(Integer, ForeignKey('facility.shakecast_id'))
    name = Column(String)
    value = Column(String)

    def __repr__(self):
        return '''Attribute(shakecast_id={},
                        facility_id={},
                        name={},
                        value={}
                    )'''.format(
            self.shakecast_id,
            self.facility_id,
            self.name,
            self.value
        )


class Aebm(Base):
    __tablename__ = 'aebm'
    facility_id = Column(Integer, ForeignKey(
        'facility.shakecast_id'), primary_key=True)
    mbt = Column(String(20))
    sdl = Column(String(50))
    bid = Column(Integer)
    height = Column(Integer)
    stories = Column(Integer)
    year = Column(Integer)
    performance_rating = Column(String(50))
    quality_rating = Column(String(50))
    elastic_period = Column(Float)
    elastic_damping = Column(Float)
    design_period = Column(Float)
    ultimate_period = Column(Float)
    design_coefficient = Column(Float)
    modal_weight = Column(Float)
    modal_height = Column(Float)
    modal_response = Column(Float)
    pre_yield = Column(Float)
    post_yield = Column(Float)
    max_strength = Column(Float)
    ductility = Column(Float)
    default_damage_state_beta = Column(Float)

    def has_required(self):
        return (self.mbt and self.sdl and self.bid and
                self.height and self.stories and self.year)


class FacilityShaking(Base):
    __tablename__ = 'facility_shaking'
    sort_by = 'weight'
    shakecast_id = Column(Integer, primary_key=True)
    shakemap_id = Column(Integer, ForeignKey('shakemap.shakecast_id'))
    facility_id = Column(Integer, ForeignKey('facility.shakecast_id'))
    metric = Column(String(20))
    alert_level = Column(String(20))
    epicentral_distance = Column(Float(2))
    gray = Column(Float)
    green = Column(Float)
    yellow = Column(Float)
    orange = Column(Float)
    red = Column(Float)
    pga = Column(Float)
    pgv = Column(Float)
    mmi = Column(Float)
    psa03 = Column(Float)
    psa10 = Column(Float)
    psa30 = Column(Float)
    aebm = Column(String(50))
    weight = Column(Float)

    def __init__(self, **kwargs):
        '''
        Adjust the constructor to allow us to pass in anything as a 
        key word, and filter out the ones we don't want to use
        '''
        cls_ = type(self)
        move_on = {}
        for k in kwargs:
            if hasattr(cls_, k):
                move_on[k] = kwargs[k]

        # now let sqlalchemy do the real initialization
        super(FacilityShaking, self).__init__(**move_on)

    @hybrid_property
    def geojson(self):
        geojson = GeoJson()
        geojson['properties'] = {
            'lat': self.facility.lat,
            'lon': self.facility.lon,
            'name': self.facility.name,
            'facility_type': self.facility.facility_type,
            'description': self.facility.description,
            'shaking': {
                'metric': self.metric,
                'alert_level': self.alert_level,
                'epicentral_distance': self.epicentral_distance,
                'gray': self.gray,
                'green': self.green,
                'yellow': self.yellow,
                'orange': self.orange,
                'red': self.red,
                'pga': self.pga,
                'pgv': self.pgv,
                'mmi': self.mmi,
                'psa03': self.psa03,
                'psa10': self.psa10,
                'psa30': self.psa30,
                'weight': self.weight
            }
        }

        geojson.set_coordinates(
            get_geojson_latlon(geojson['properties'])
        )

        return geojson

    @hybrid_property
    def simple_exceedance(self):
        exceedance = None
        alert_level = None
        next_alert_level = None
        for level in IMPACT_RANKS:
            if level['name'] == self.alert_level:
                alert_level = level

            if alert_level and (level['rank'] > alert_level['rank']):
                if getattr(self.facility, level['name'], False):
                    next_alert_level = level
                    break

        if not self.metric or not alert_level:
            return None

        shaking = getattr(self, self.metric.lower(), None)
        threshold = getattr(self.facility, alert_level['name'], None)

        if threshold == 0:
            return 1

        if shaking is not None and threshold is not None:
            if next_alert_level:
                next_threshold = getattr(
                    self.facility, next_alert_level['name'])

                exceedance = (shaking - threshold) / \
                    (next_threshold - threshold)
            elif alert_level:
                exceedance = (shaking - threshold) / threshold

        if exceedance < 0:
            exceedance = 0
        return exceedance

    @hybrid_property
    def impact_rank(self):
        for level in IMPACT_RANKS:
            if level['name'] == self.alert_level:
                alert_level = level
                break

        simple_exceedance = self.simple_exceedance
        if simple_exceedance is not None:
            return self.simple_exceedance + alert_level['rank']

    def __repr__(self):
        return '''FacilityShaking(shakemap_id=%s,
                                   facility_id=%s,
                                   metric=%s,
                                   alert_level=%s,
                                   weight=%s,
                                   gray=%s,
                                   green=%s,
                                   yellow=%s,
                                   orange=%s,
                                   red=%s,
                                   pga=%s,
                                   pgv=%s,
                                   mmi=%s,
                                   psa03=%s,
                                   psa10=%s,
                                   psa30=%s)''' % (self.shakemap_id,
                                                   self.facility_id,
                                                   self.metric,
                                                   self.alert_level,
                                                   self.weight,
                                                   self.gray,
                                                   self.green,
                                                   self.yellow,
                                                   self.orange,
                                                   self.red,
                                                   self.pga,
                                                   self.pgv,
                                                   self.mmi,
                                                   self.psa03,
                                                   self.psa10,
                                                   self.psa30)

    def __eq__(self, other):
        return int(self[self.sort_by] * 10000) == int(other[self.sort_by] * 10000)

    def __lt__(self, other):
        return int(self[self.sort_by] * 10000) < int(other[self.sort_by] * 10000)

    def __le__(self, other):
        return int(self[self.sort_by] * 10000) <= int(other[self.sort_by] * 10000)

    def __gt__(self, other):
        return int(self[self.sort_by] * 10000) > int(other[self.sort_by] * 10000)

    def __ge__(self, other):
        return int(self[self.sort_by] * 10000) >= int(other[self.sort_by] * 10000)

    def __hash__(self):
        return hash(self.shakecast_id)

    def __getitem__(self, field):
        return self.__dict__[field]

#######################################################################
######################## Notification Tables ##########################

class Notification(Base):
    __tablename__ = 'notification'
    shakecast_id = Column(Integer, primary_key=True)
    shakemap_id = Column(Integer, ForeignKey('shakemap.shakecast_id'))
    event_id = Column(Integer, ForeignKey('event.shakecast_id'))
    group_id = Column(Integer, ForeignKey('group.shakecast_id'))
    notification_type = Column(String(25))
    status = Column(String(64))
    sent_timestamp = Column(Float)
    generated_timestamp = Column(Float)
    notification_file = Column(String(255))
    error = Column(String(255))

    def get_json(self):
      return {
          'shakecastId': self.shakecast_id,
          'shakemapId': self.shakemap_id,
          'eventId': self.event_id,
          'groupId': self.group_id,
          'group': self.group.name,
          'notificationType': self.notification_type,
          'status': self.status,
          'sentTimestamp': self.sent_timestamp,
          'generatedTimestamp': self.generated_timestamp,
          'notificationFile': self.notification_file,
          'error': self.error
      }

    def __repr__(self):
        return '''Notification(shakemap_id=%s,
                               group=%s,
                               notification_type=%s,
                               status=%s,
                               sent_timestamp=%s,
                               notification_file=%s)''' % (self.shakemap_id,
                                                           self.group.name,
                                                           self.notification_type,
                                                           self.status,
                                                           self.sent_timestamp,
                                                           self.notification_file)
    def get_sent_timestamp(self):
        """
        Non-static timestamp that changes based on the user's defined
        timezone
        """
        if not self.sent_timestamp:
            return None

        clock = Clock()
        return (clock.from_time(self.sent_timestamp)
                .strftime('%Y-%m-%d %H:%M:%S'))

    def get_generated_timestamp(self):
        """
        Non-static timestamp that changes based on the user's defined
        timezone
        """
        if not self.generated_timestamp:
            return None

        clock = Clock()
        return (clock.from_time(self.sent_timestamp)
                .strftime('%Y-%m-%d %H:%M:%S'))


class User(Base):
    __tablename__ = 'user'
    shakecast_id = Column(Integer, primary_key=True)
    username = Column(String(32))
    password = Column(String(255))
    email = Column(String(255))
    mms = Column(String(255))
    phone_number = Column(String(25))
    full_name = Column(String(32))
    user_type = Column(String(10))
    group_string = Column(String(1000))
    updated = Column(Integer)
    updated_by = Column(String(1000))

    groups = relationship('Group',
                          secondary='user_group_connection',
                          backref='users')

    def __repr__(self):
        return '''User(username=%s,
                       password=%s,
                       email=%s,
                       mms=%s,
                       phone_number=%s,
                       full_name=%s,
                       user_type=%s)''' % (self.username,
                                           self.password,
                                           self.email,
                                           self.mms,
                                           self.phone_number,
                                           self.full_name,
                                           self.user_type)

    @staticmethod
    def is_authenticated():
        return True

    @staticmethod
    def is_active():
        return True

    @staticmethod
    def is_anonymous():
        return False

    def get_id(self):
        return str(self.shakecast_id)

    def is_admin(self):
        return self.user_type.lower() == 'admin'


class Group(Base):
    __tablename__ = 'group'
    shakecast_id = Column(Integer, primary_key=True)
    name = Column(String(25))
    facility_type = Column(String(25))
    lon_min = Column(Float)
    lon_max = Column(Float)
    lat_min = Column(Float)
    lat_max = Column(Float)
    template = Column(String(255))
    updated = Column(Integer)
    updated_by = Column(String(32))
    product_string = Column(String(255), default='pdf')

    facilities = relationship('Facility',
                              secondary='facility_group_connection',
                              backref='groups')

    past_notifications = relationship('Notification',
                                      backref='group',
                                      cascade='save-update, delete')

    specs = relationship('GroupSpecification',
                         backref='group',
                         cascade='save-update, delete, delete-orphan')

    def __repr__(self):
        return '''Group(name=%s,
                        facility_type=%s,
                        lon_min=%s,
                        lon_max=%s,
                        lat_min=%s,
                        lat_max=%s)''' % (self.name,
                                          self.facility_type,
                                          self.lon_min,
                                          self.lon_max,
                                          self.lat_min,
                                          self.lat_max)

    def __str__(self):
        return self.name

    @hybrid_method
    def in_grid(self, grid):
        # check if a point is within the boundaries of the grid
        return ((self.lon_min > grid.lon_min and
                 self.lon_min < grid.lon_max and
                 self.lat_min > grid.lat_min and
                 self.lat_min < grid.lat_max) or
                (self.lon_min > grid.lon_min and
                    self.lon_min < grid.lon_max and
                    self.lat_max > grid.lat_min and
                    self.lat_max < grid.lat_max) or
                (self.lon_max > grid.lon_min and
                    self.lon_max < grid.lon_max and
                    self.lat_min > grid.lat_min and
                    self.lat_min < grid.lat_max) or
                (self.lon_max > grid.lon_min and
                    self.lon_max < grid.lon_max and
                    self.lat_max > grid.lat_min and
                    self.lat_max < grid.lat_max) or
                (self.lon_min < grid.lon_min and
                    self.lon_max > grid.lon_min and
                    self.lat_min < grid.lat_min and
                    self.lat_max > grid.lat_min) or
                (self.lon_min < grid.lon_min and
                    self.lon_max > grid.lon_min and
                    self.lat_min < grid.lat_max and
                    self.lat_max > grid.lat_max) or
                (self.lon_min < grid.lon_max and
                    self.lon_max > grid.lon_max and
                    self.lat_min < grid.lat_min and
                    self.lat_max > grid.lat_min) or
                (self.lon_min < grid.lon_min and
                    self.lon_max > grid.lon_max and
                    self.lat_min < grid.lat_min and
                    self.lat_max > grid.lat_max))

    @in_grid.expression
    def in_grid(cls, grid):
        # check if a point is within the boundaries of the grid
        return or_(and_(cls.lon_min > grid.lon_min,
                        cls.lon_min < grid.lon_max,
                        cls.lat_min > grid.lat_min,
                        cls.lat_min < grid.lat_max),
                   and_(cls.lon_min > grid.lon_min,
                        cls.lon_min < grid.lon_max,
                        cls.lat_max > grid.lat_min,
                        cls.lat_max < grid.lat_max),
                   and_(cls.lon_max > grid.lon_min,
                        cls.lon_max < grid.lon_max,
                        cls.lat_min > grid.lat_min,
                        cls.lat_min < grid.lat_max),
                   and_(cls.lon_max > grid.lon_min,
                        cls.lon_max < grid.lon_max,
                        cls.lat_max > grid.lat_min,
                        cls.lat_max < grid.lat_max),
                   and_(cls.lon_min < grid.lon_min,
                        cls.lon_max > grid.lon_min,
                        cls.lat_min < grid.lat_min,
                        cls.lat_max > grid.lat_min),
                   and_(cls.lon_min < grid.lon_min,
                        cls.lon_max > grid.lon_min,
                        cls.lat_min < grid.lat_max,
                        cls.lat_max > grid.lat_max),
                   and_(cls.lon_min < grid.lon_max,
                        cls.lon_max > grid.lon_max,
                        cls.lat_min < grid.lat_min,
                        cls.lat_max > grid.lat_min),
                   and_(cls.lon_min < grid.lon_max,
                        cls.lon_max > grid.lon_max,
                        cls.lat_min < grid.lat_max,
                        cls.lat_max > grid.lat_max))

    @hybrid_method
    def point_inside(self, point):
        return (self.lat_min <= point.lat and
                self.lat_max >= point.lat and
                self.lon_min <= point.lon and
                self.lon_max >= point.lon)

    @point_inside.expression
    def point_inside(cls, point):
        return and_(cls.lat_min <= point.lat,
                    cls.lat_max >= point.lat,
                    cls.lon_min <= point.lon,
                    cls.lon_max >= point.lon)

    def _get_specs(self,
                   notification_type,
                   scenario=False,
                   heartbeat=False,
                   inspection=None):
        notification_type = notification_type.lower()
        specs = [s for s in self.specs if
                 s.notification_type.lower() == notification_type]
        filtered = [s for s in specs if
                    (((s.event_type.lower() == 'scenario') is scenario)
                     and ((s.event_type.lower() == 'heartbeat') is heartbeat)
                     or s.event_type.lower() == 'all')]

        if len(filtered) > 0 and inspection is not None:
            filtered = [s for s in filtered if
                        str(s.inspection_priority).lower() == inspection.lower()]

        return filtered

    def get_new_event_spec(self, scenario=False, heartbeat=False):
        specs = self._get_specs(
            'new_event', scenario=scenario, heartbeat=heartbeat)

        return specs[0] if len(specs) > 0 else None

    def get_inspection_spec(self, inspection, scenario=False):
        specs = self._get_specs(
            'damage', inspection=inspection, scenario=scenario)

        # check for english spelling "grey"
        if not specs and inspection == 'gray':
            specs = self._get_specs(
                'damage', inspection='grey', scenario=scenario)            

        return specs[0] if len(specs) > 0 else None

    def gets_notification(self, notification_type, scenario=False, heartbeat=False):
        specs = self._get_specs(notification_type,
                                scenario=scenario,
                                heartbeat=heartbeat)

        return len(specs) > 0

    def has_alert_level(self, level, scenario=False):
        # gray groups get no-inspection notifications
        if ((level is None) or
                (level.lower() == 'gray') or
                (level.lower() == 'grey')):
            levels = ['gray', 'grey']
        else:
            levels = [level]

        for level in levels:
            spec = self.get_inspection_spec(level, scenario)

            if spec is not None:
                return True

        return False

    def get_alert_levels(self, scenario=False):
        specs = self._get_specs('damage', scenario=scenario)

        alert_levels = [spec.inspection_priority.lower() for spec in specs
                if spec is not None]
        
        # allow gray, grey mixup
        if 'gray' in alert_levels or 'grey' in alert_levels:
            alert_levels += ['grey', 'gray']
        
        return alert_levels

    def get_scenario_alert_levels(self):
        specs = self._get_specs('damage', scenario=True)

        return [spec.inspection_priority.lower() for spec in specs
                if spec is not None]

    def check_min_mag(self, mag):
        new_event = self.get_new_event_spec()

        return (new_event.minimum_magnitude < mag
                if new_event is not None else None)

    def get_min_mag(self):
        new_event = self.get_new_event_spec()

        return new_event.minimum_magnitude if new_event is not None else None

    def get_notification_format(self, notification, scenario=False):
        if (notification.notification_type == 'DAMAGE'):
            alert_level = notification.shakemap.get_alert_level(self)
            spec = self.get_inspection_spec(alert_level, scenario)
        else:
            heartbeat = notification.event.type == 'heartbeat'
            spec = self.get_new_event_spec(scenario=scenario,
                                           heartbeat=heartbeat)

        if spec is None:
            return None

        format_ = str(spec.notification_format).lower()

        # Catch mms and sms messages
        if (format_ == 'mms') or (format_ == 'sms'):
            return 'mms'

        # Return email as default
        return 'email'

    @hybrid_property
    def geojson(self):
        geojson = GeoJson()
        geojson['properties'] = {
            'shakecast_id': self.shakecast_id,
            'name': self.name, 
            'facility_type': self.facility_type,
            'lon_min': self.lon_min,
            'lon_max': self.lon_max,
            'lat_min': self.lat_min,
            'lat_max': self.lat_max,
            'template': self.template,
            'updated': self.updated,
            'updated_by': self.updated_by,
            'product_string': self.product_string
        }

        geojson.set_coordinates(
            get_geojson_latlon(geojson['properties'])
        )

        return geojson

class GroupSpecification(Base):
    __tablename__ = 'group_specification'
    shakecast_id = Column(Integer, primary_key=True)
    group_id = Column(Integer, ForeignKey('group.shakecast_id'))
    notification_type = Column(String(25))
    event_type = Column(String(25))
    inspection_priority = Column(String(10))
    minimum_magnitude = Column(Integer)
    notification_format = Column(String(25))
    aggregate_name = Column(String(25))

    def __repr__(self):
        return '''GroupSpecification(group_id=%s,
                                      notification_type=%s,
                                      inspection_priority=%s,
                                      minimum_magnitude=%s,
                                      notification_format=%s,
                                      aggregate_name=%s)''' % (self.group_id,
                                                               self.notification_type,
                                                               self.inspection_priority,
                                                               self.minimum_magnitude,
                                                               self.notification_format,
                                                               self.aggregate_name)


# Connection tables
user_group_connection = Table('user_group_connection', Base.metadata,
                              Column('user',
                                     Integer,
                                     ForeignKey('user.shakecast_id',
                                                ondelete='cascade'),
                                     primary_key=True),
                              Column('group',
                                     Integer,
                                     ForeignKey('group.shakecast_id',
                                                ondelete='cascade'),
                                     primary_key=True)
                              )

facility_group_connection = Table('facility_group_connection', Base.metadata,
                                  Column('facility',
                                         Integer, ForeignKey('facility.shakecast_id',
                                                             ondelete='cascade'),
                                         primary_key=True),
                                  Column('group',
                                         Integer,
                                         ForeignKey('group.shakecast_id',
                                                    ondelete='cascade'),
                                         primary_key=True)
                                  )


#######################################################################
######################### Earthquake Tables ###########################

class Event(Base):
    __tablename__ = 'event'
    shakecast_id = Column(Integer, primary_key=True)
    event_id = Column(String(80))
    status = Column(String(64))
    type = Column(String(64))
    all_event_ids = Column(String(255))
    lat = Column(Float)
    lon = Column(Float)
    depth = Column(Float)
    magnitude = Column(Float)
    title = Column(String(100))
    place = Column(String(255))
    time = Column(Integer)
    updated = Column(Integer)
    override_directory = Column(String(255))

    shakemaps = relationship('ShakeMap',
                             backref='event')

    notifications = relationship('Notification',
                                 backref='event')

    def __init__(self, save=False, *args, **kwargs):
        super(Event, self).__init__(*args, **kwargs)
        if save:
            if not os.path.exists(self.directory_name):
                os.makedirs(self.directory_name)

    def __repr__(self):
        return '''Event(event_id=%s,
                        all_event_ids=%s,
                        lat=%s,
                        lon=%s,
                        magnitude=%s,
                        title=%s,
                        place=%s,
                        time=%s)''' % (self.event_id,
                                       self.all_event_ids,
                                       self.lat,
                                       self.lon,
                                       self.magnitude,
                                       self.title,
                                       self.place,
                                       self.time)

    def __str__(self):
        return self.event_id

    @hybrid_property
    def directory_name(self):
        if self.override_directory:
            return self.override_directory
        if self.type == 'test':
            base_dir = os.path.join(sc_dir(), 'tests', 'data')
        else:
            base_dir = get_data_dir()

        return os.path.join(base_dir, self.event_id)

    @hybrid_property
    def local_products_dir(self):
        if self.override_directory:
            return self.override_directory

        if self.type == 'test':
            base_dir = os.path.join(sc_dir(), 'tests', 'data')
        else:
            base_dir = get_local_products_dir()

        return os.path.join(base_dir, self.event_id)

    def is_new(self):
        """
        Check if this Event is new
        """

        # Get all ids associated with this event
        ids = self.all_event_ids.strip(',').split(',')
        events = []

        for each_id in ids:
            stmt = (select([Event.__table__.c.event_id])
                    .where(Event.__table__.c.event_id == each_id))
            result = engine.execute(stmt)
            events += [row for row in result]

        return not bool(events)

    def timestamp(self):
        """
        Non-static timestamp that changes based on the user's defined
        timezone
        """
        clock = Clock()
        return (clock.from_time(self.time)
                .strftime('%Y-%m-%d %H:%M:%S'))
    

    @hybrid_property
    def geojson(self):
        geojson = GeoJson()
        geojson['properties'] = {
            'shakecast_id': self.shakecast_id,
            'event_id': self.event_id,
            'status': self.status,
            'type': self.type,
            'all_event_ids': self.all_event_ids,
            'lat': self.lat,
            'lon': self.lon,
            'depth': self.depth,
            'magnitude': self.magnitude,
            'title': self.title,
            'place': self.place,
            'time': self.time,
            'updated': self.updated,
            'override_directory': self.override_directory
        }

        geojson.set_coordinates(
            get_geojson_latlon(geojson['properties'])
        )

        return geojson


class ShakeMap(Base):
    __tablename__ = 'shakemap'
    shakecast_id = Column(Integer, primary_key=True)
    shakemap_id = Column(String(80))
    event_id = Column(Integer,
                      ForeignKey('event.shakecast_id'))
    shakemap_version = Column(Integer)
    status = Column(String(64))
    type = Column(String(64))
    map_status = Column(String(24))
    event_version = Column(Integer)
    generating_server = Column(Integer)
    region = Column(String(10))
    lat_min = Column(Float)
    lat_max = Column(Float)
    lon_min = Column(Float)
    lon_max = Column(Float)
    generation_timestamp = Column(String(32))
    recieve_timestamp = Column(String(32))
    begin_timestamp = Column(Float)
    end_timestamp = Column(Float)
    superceded_timestamp = Column(Float)
    override_directory = Column(String(255))

    products = relationship('Product',
                            backref='shakemap',
                            cascade='save-update, delete')

    notifications = relationship('Notification',
                                 backref='shakemap')

    facility_shaking = relationship('FacilityShaking',
                                    backref='shakemap',
                                    order_by='desc(FacilityShaking.weight)',
                                    cascade='save-update, delete, delete-orphan')

    local_products = relationship('LocalProduct',
                                  backref='shakemap',
                                  cascade='save-update, delete, delete-orphan')

    def __init__(self, save=False, *args, **kwargs):
        super(ShakeMap, self).__init__(*args, **kwargs)
        if save:
            if not os.path.exists(self.directory_name):
                os.makedirs(self.directory_name)
            if not os.path.exists(self.event.local_products_dir):
                os.makedirs(self.event.local_products_dir)
            if not os.path.exists(self.local_products_dir):
                os.makedirs(self.local_products_dir)

    def __repr__(self):
        return '''ShakeMap(shakemap_id=%s,
                           status=%s,
                           map_status=%s,
                           event_id=%s,
                           event_version=%s,
                           generating_server=%s,
                           region=%s,
                           lat_min=%s,
                           lat_max=%s,
                           lon_min=%s,
                           lon_max=%s,
                           generation_timestamp=%s,
                           recieve_timestamp=%s,
                           begin_timestamp=%s,
                           end_timestamp=%s,
                           superceded_timestamp=%s,
                           directory_name=%s)''' % (self.shakemap_id,
                                                    self.status,
                                                    self.map_status,
                                                    self.event_id,
                                                    self.event_version,
                                                    self.generating_server,
                                                    self.region,
                                                    self.lat_min,
                                                    self.lat_max,
                                                    self.lon_min,
                                                    self.lon_max,
                                                    self.generation_timestamp,
                                                    self.recieve_timestamp,
                                                    self.begin_timestamp,
                                                    self.end_timestamp,
                                                    self.superceded_timestamp,
                                                    self.directory_name)

    def __str__(self):
        return self.shakemap_id

    @hybrid_property
    def directory_name(self):
        if self.override_directory:
            return self.override_directory

        if self.type == 'test':
            base_dir = os.path.join(sc_dir(), 'tests', 'data')
        else:
            base_dir = get_data_dir()

        return os.path.join(
            base_dir,
            self.shakemap_id,
            self.shakemap_id + '-' + str(self.shakemap_version)
        )

    @hybrid_property
    def local_products_dir(self):
        if self.override_directory:
            return self.override_directory

        return os.path.join(
            get_local_products_dir(),
            self.shakemap_id,
            self.shakemap_id + '-' + str(self.shakemap_version))

    def save_local_product(self, name, content, write_method='w'):
        product_name = os.path.join(self.local_products_dir, name)
        with open(product_name, write_method) as file_:
            file_.write(content)
        
        return product_name

    def get_local_product(self, name, group=None):
        # check for group specific products first
        for product in self.local_products:
            if (product.product_type and
                    (product.product_type.name == name) and
                    (product.group == group)):
                return product
        
        # check for products not associated with the group
        for product in self.local_products:
            if (product.product_type and
                    (product.product_type.name == name) and
                    (product.group is None)):
                return product
        
        return None
    
    def get_product(self, product_type):
        for product in self.products:
            if product.product_type == product_type:
                return product
        
        return None

    def old_maps(self):
        """
        Returns 0 for false and an integer count of old shakemaps for true
        """
        stmt = (select([ShakeMap.__table__.c.shakecast_id])
                .where(and_(ShakeMap.__table__.c.shakemap_id == self.shakemap_id,
                            ShakeMap.__table__.c.shakemap_version < self.shakemap_version)))

        result = engine.execute(stmt)
        old_shakemaps = [row for row in result]

        return len(old_shakemaps)

    def has_products(self, req_prods):
        shakemap_prods = [
            prod.product_type for prod in self.products if prod.status == 'downloaded' and prod.error is None]
        for prod in req_prods:
            if prod not in shakemap_prods:
                return False
        return True

    def get_map(self):
        shakemap_file = os.path.join(self.directory_name, 'intensity.jpg')
        shakemap_image = open(shakemap_file, 'rb')
        map_image = shakemap_image.read()
        shakemap_image.close()
        return map_image

    def get_overlay(self):
        overlay_names = ['intensity_overlay.png', 'ii_overlay.png']
        for name in overlay_names:
            full_name = os.path.join(self.directory_name, name)
            if os.path.isfile(full_name):
                return full_name

    def get_overlay_base64(self):
        overlay_names = ['intensity_overlay.png', 'ii_overlay.png']
        file_name = None
        for name in overlay_names:
            full_name = os.path.join(self.directory_name, name)
            if os.path.isfile(full_name):
                file_name = full_name
                break

        if not file_name:
            return None

        with open(file_name, 'rb') as file_:
            encoded_string = base64.b64encode(file_.read())

        return encoded_string


    def get_alert_level(self, group=None):
        """
        Determine the alert level for a shakemap or for a specific group
        """

        alert_level = None
        if len(self.facility_shaking) > 0:
            if group is not None:
                facility_shaking = [x for x in self.facility_shaking if group in x.facility.groups]
            else:
                facility_shaking = self.facility_shaking

            if len(facility_shaking) > 0:
                facility_shaking = sorted(facility_shaking, key=lambda x: x.weight if x.weight else 0)
                alert_level = facility_shaking[-1].alert_level
        return alert_level

    def get_impact_summary(self, group=None):
        if group is not None:
            facility_shaking = [x for x in self.facility_shaking if group in x.facility.groups]
        else:
            facility_shaking = self.facility_shaking

        return get_event_impact(facility_shaking)

    def mark_processing_start(self):
        self.status = 'processing_started'
        self.begin_timestamp = time.time()

    def mark_processing_finished(self):
        self.status = 'processed'
        self.end_timestamp = time.time()

    def sort_facility_shaking(self, sort_by, reverse=True):
        FacilityShaking.sort_by = sort_by
        self.facility_shaking = sorted(self.facility_shaking, reverse=reverse)

    @hybrid_property
    def geojson(self):
        geojson = GeoJson()
        geojson['properties'] = {
            'shakecast_id': self.shakecast_id,
            'shakemap_id': self.shakemap_id,
            'event_id': self.event_id,
            'shakemap_version': self.shakemap_version,
            'status': self.status,
            'type': self.type,
            'map_status': self.map_status,
            'event_version': self.event_version,
            'generating_server': self.generating_server,
            'region': self.region,
            'lat_min': self.lat_min,
            'lat_max': self.lat_max,
            'lon_min': self.lon_min,
            'lon_max': self.lon_max,
            'generation_timestamp': self.generation_timestamp,
            'recieve_timestamp': self.recieve_timestamp,
            'begin_timestamp': self.begin_timestamp,
            'end_timestamp': self.end_timestamp,
            'superceded_timestamp': self.superceded_timestamp,
            'override_directory': self.override_directory
        }

        geojson.set_coordinates(
            get_geojson_latlon(geojson['properties'])
        )

        return geojson


class Product(Base):
    __tablename__ = 'product'
    shakecast_id = Column(Integer, primary_key=True)
    shakemap_id = Column(Integer,
                         ForeignKey('shakemap.shakecast_id'))
    product_type = Column(String(32))
    name = Column(String(32))
    description = Column(String(255))
    metric = Column(String(10))
    filename = Column(String(32))
    url = Column(String(255))
    display = Column(Integer)
    source = Column(String(64))
    status = Column(String(64))
    error = Column(String(10000))
    update_username = Column(String(32))
    update_timestamp = Column(String(32))

    def __repr__(self):
        return '''Product(product_type=%s,
                          name=%s,
                          description=%s,
                          metric=%s,
                          url=%s,
                          display=%s,
                          source=%s,
                          update_username=%s,
                          update_timestamp=%s)''' % (self.product_type,
                                                     self.name,
                                                     self.description,
                                                     self.metric,
                                                     self.url,
                                                     self.display,
                                                     self.source,
                                                     self.update_username,
                                                     self.update_timestamp)

    @hybrid_property
    def file_name(self):
        if self.shakemap:
            file_name = os.path.join(self.shakemap.directory_name, self.product_type)
            return file_name
        
        return None


class LocalProduct(Base):
    __tablename__ = 'local_products'
    id = Column(Integer, primary_key=True)
    type = Column(String,
                     ForeignKey('local_product_types.name'))
    shakemap_id = Column(Integer,
                         ForeignKey('shakemap.shakecast_id'))
    group_id = Column(Integer,
                         ForeignKey('group.shakecast_id'))
    name = Column(String(255))
    status = Column(String(255), default='created')
    tries = Column(Integer, default=0)
    begin_timestamp = Column(Float)
    finish_timestamp = Column(Float, default=0)
    error = Column(String(255))

    product_type = relationship('LocalProductType',
                                backref='products')
    group = relationship('Group',
                                backref='products')

    def __init__(self, *args, **kwargs):
        super(LocalProduct, self).__init__(*args, **kwargs)
        self.begin_timestamp = time.time()
        self.finish_timestamp = 0
        self.tries = 0

    def __repr__(self):
        return '''LocalProduct(type: {},
        shakemap_id: {},
        shakemap_version: {},
        group_id: {},
        name: {},
        status: {},
        begin_timestamp: {},
        finish_timestamp: {}
        error: {}'''.format(self.type, self.shakemap_id, self.shakemap.shakemap_version, self.group_id, self.name,
        self.status, self.begin_timestamp, self.finish_timestamp, self.error)


    def __str__(self):
        return '''LocalProduct(type: {},
        shakemap_id: {},
        shakemap_version: {},
        group_name: {},
        name: {},
        status: {},
        begin_timestamp: {},
        finish_timestamp: {}
        error: {}'''.format(self.type, self.shakemap_id, self.shakemap.shakemap_version,
        None if not self.group else self.group.name, self.name,
        self.status, self.begin_timestamp, self.finish_timestamp, self.error)


    def generate(self):
        generate_function = eval(self.product_type.generate_function)
        result = generate_function.main(self.group, self.shakemap, self.name)

        return result

    def check_dependencies(self):
        if self.product_type.dependencies:
            dep_list = self.product_type.dependencies.split(',')
            for dep in dep_list:
                product = self.shakemap.get_local_product(dep, self.group)

                if product is None or (product.error or not product.finish_timestamp):
                    return False

        return True

    def read(self):
        name = os.path.join(self.shakemap.local_products_dir, self.name)
        with open(name, self.product_type.read_type) as product:
            read_product = product.read()
        
        return read_product

    def write(self, content):
        name = os.path.join(self.shakemap.local_products_dir, self.name)
        with open(name, self.product_type.write_type) as product:
            product.write(content)

class LocalProductType(Base):
    __tablename__ = 'local_product_types'
    name = Column(String(100), primary_key=True)
    dependencies = Column(String(100))
    type = Column(String(100))
    generate_function = Column(String(100))
    read_type = Column(String(10))
    write_type = Column(String(10))
    file_name = Column(String(100))
    subtype = Column(String(10), default='plain')


def sql_to_obj(sql):
    '''
    Convert SQLAlchemy objects into dictionaries for use after
    session closes
    '''

    if isinstance(sql, Base):
        obj = {}

        sql_class = type(sql)
        class_keys = list(inspect(sql_class).all_orm_descriptors.keys())

        filtered_keys = [key for key in class_keys if '__' not in key and key[0] != '_']
        for attribute in filtered_keys:
            if not obj.get(attribute, False):
                try:
                    obj_attr = getattr(sql, attribute)

                    # don't include functions
                    if (not hasattr(obj_attr, '__call__') and
                            not isinstance(obj_attr, Base) and
                            not isinstance(obj_attr, list) and
                            not isinstance(obj_attr, dict)):
                        obj[attribute] = obj_attr
                except:
                    # can't access it for some reason
                    pass
        
        sql = obj

    elif isinstance(sql, list):
        obj = []

        for item in sql:
            if (isinstance(item, dict) or
                    isinstance(item, list) or
                    isinstance(item, Base)):
                obj.append(sql_to_obj(item))

    elif isinstance(sql, dict):
        obj = {}

        # remove sqlalchemy state
        if sql.get('_sa_instance_state', False):
            sql.pop('_sa_instance_state')

        for key in list(sql.keys()):
            item = sql[key]
            if isinstance(item, Base) or isinstance(item, dict):
                item = sql_to_obj(item)
            
            elif isinstance(item, list):
                for obj in item:
                    if isinstance(obj, Base):
                        item = sql_to_obj(item)
            
            obj[key] = item

    else:
        obj = sql

    return obj
