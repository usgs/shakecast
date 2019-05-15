import os
import sys
import inspect as inspect_mod
import time
from math import floor
from functools import wraps
from werkzeug.security import generate_password_hash

from sqlalchemy import *
from sqlalchemy.ext.declarative import *
from sqlalchemy.ext.hybrid import hybrid_method, hybrid_property
from sqlalchemy.orm import *
from sqlalchemy.sql import and_, or_
from sqlalchemy.orm.session import Session as SessionClass

from util import *
from .impact import get_event_impact, get_impact

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
        return  or_(and_(cls.lon_min > grid.lon_min,
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
    facility_id = Column(Integer, ForeignKey('facility.shakecast_id'), primary_key=True)
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
    weight = Column(Float)
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
    def __cmp__(self, other):
        if int(getattr(self, self.sort_by.lower()) * 10000) > int(getattr(other, self.sort_by.lower()) * 10000):
            return 1
        elif int(getattr(self, self.sort_by.lower()) * 10000) < int(getattr(other, self.sort_by.lower()) * 10000):
            return -1
        else:
            return 0
    
    
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
    notification_file = Column(String(255))
    
    def __repr__(self):
        return '''Notification(shakemap_id=%s,
                               group_id=%s,
                               notification_type=%s,
                               status=%s,
                               sent_timestamp=%s,
                               notification_file=%s)''' % (self.shakemap_id,
                                                             self.group_id,
                                                             self.notification_type,
                                                             self.status,
                                                             self.sent_timestamp,
                                                             self.notification_file)
    
      
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
        return unicode(self.shakecast_id)
    
    def is_admin(self):
        return self.user_type.lower() == 'admin'
    
    
  
    
class Group(Base):
    __tablename__ = 'group'
    shakecast_id = Column(Integer, primary_key=True)
    name = Column(String(25))
    facility_type = Column(String(25))
    lon_min = Column(Integer)
    lon_max = Column(Integer)
    lat_min = Column(Integer)
    lat_max = Column(Integer)
    template = Column(String(255))
    updated = Column(Integer)
    updated_by = Column(String(32))
    
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
        return  or_(and_(cls.lon_min > grid.lon_min,
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
        specs = self._get_specs('damage', inspection=inspection, scenario=scenario)

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

    def get_alert_levels(self):
        specs = self._get_specs('damage')

        return [spec.inspection_priority.lower() for spec in specs
                if spec is not None]

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
            alert_level = notification.shakemap.get_alert_level()
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
    
    shakemaps = relationship('ShakeMap',
                             backref='event')
    
    notifications = relationship('Notification',
                                    backref='event')
    
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
        if self.type == 'test':
            base_dir = os.path.join(sc_dir(), 'tests', 'data')
        else:
            base_dir = get_data_dir()

        return os.path.join(base_dir, self.event_id)
    
    @hybrid_property
    def local_products_dir(self):
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
        from util import Clock
        clock = Clock()
        return (clock.from_time(self.time)
                    .strftime('%Y-%m-%d %H:%M:%S'))


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
    gray = Column(Integer)
    green = Column(Integer)
    yellow = Column(Integer)
    orage = Column(Integer)
    red = Column(Integer)
    
    products = relationship('Product',
                            backref='shakemap',
                            cascade='save-update, delete')
    
    notifications = relationship('Notification',
                                 backref = 'shakemap')

    facility_shaking = relationship('FacilityShaking',
                                    backref='shakemap',
                                    cascade='save-update, delete, delete-orphan')
    
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
        return os.path.join(
            get_local_products_dir(),
            self.shakemap_id,
            self.shakemap_id + '-' + str(self.shakemap_version))
    
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

    def is_new(self):
        stmt = (select([ShakeMap.__table__.c.shakecast_id])
                    .where(and_(ShakeMap.__table__.c.shakemap_id == self.shakemap_id,
                                ShakeMap.__table__.c.shakemap_version == self.shakemap_version)))
        
        result = engine.execute(stmt)
        shakemaps = [row for row in result]
        
        return len(shakemaps) == 0
           
    def has_products(self, req_prods):
        shakemap_prods = [prod.product_type for prod in self.products if prod.status == 'downloaded' and prod.error is None]
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

    def get_alert_level(self):
        alert_level = None
        if len(self.facility_shaking) > 0:
            insp_val = self.facility_shaking[0].weight
            alert_levels = ['gray', 'green', 'yellow', 'orange', 'red', 'red']
            alert_level = alert_levels[int(floor(insp_val))]

        return alert_level
    
    def get_impact_summary(self):
        return get_event_impact(self.facility_shaking)

    def mark_processing_start(self):
        self.status = 'processing_started'
        if self.begin_timestamp is None:
            self.begin_timestamp = time.time()
        else:
            self.superceded_timestamp = time.time()
    
    def mark_processing_finished(self):
        self.status = 'processed'
        self.end_timestamp = time.time()
    
    def sort_facility_shaking(self, sort_by, reverse=True):
        FacilityShaking.sort_by = sort_by
        self.facility_shaking = sorted(self.facility_shaking, reverse=reverse)
 
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

#######################################################################

def clear_data(session, engine):
    meta = MetaData(engine)
    for table in reversed(meta.sorted_tables):
        print 'Clear table %s' % table
        session.execute(table.delete())
    session.commit()

# decorator for DB connection
def dbconnect(func):
    @wraps(func)
    def inner(*args, **kwargs):
        remove_session = False
        session = None

        # check if session is passed as arg
        new_args = []
        for arg in args:
            if isinstance(arg, SessionClass):
                session = arg
            else:
                new_args.append(arg)

        # get session from kwargs -- will overwrite session from
        # regular arg to ensure only one gets passed to the
        # function
        if 'session' in kwargs:
            session = kwargs.pop('session')

        # if there is no session, create one
        if session is None:
            session = Session()

            # this session is created only for this function, destroy
            # it on completion
            remove_session = True

        try:
            # run the function
            return_val = func(*new_args, session=session, **kwargs)
            session.commit()
        except:
            session.rollback()
            return_val = None
            raise
        finally:
            refresh(return_val, session=session)

            # function-specific session, close it
            if remove_session is True:
                session.expunge_all()
                Session.remove()

        return return_val
    return inner

def refresh(obj, session=None):
    if isinstance(obj, Base):
        session.refresh(obj)
    elif isinstance(obj, list):
        for o in obj:
            if isinstance(o, Base):
                session.refresh(o)
    elif isinstance(obj, dict):
        pass

def db_migration(engine):
    '''
    Check for required database migrations
    '''
    from db_migrations import migrations
    from util import SC
    sc = SC()
    for migration in migrations:
        mig_version = int(migration.__name__.split('to')[1])
        cur_version = sc.dict['Server']['update']['db_version']
        if mig_version > cur_version:
            # run the migration
            engine = migration(engine)
            # update the configs
            sc.dict['Server']['update']['db_version'] = mig_version

    session_maker = sessionmaker(bind=engine)
    Session = scoped_session(session_maker)

    sc.save_dict()
    return engine, Session

def db_init():
    # SETUP DATABASE
    sc = SC()
    # name the database, but switch to a test database if run from test.py
    db_name = sc.dict['DBConnection']['database'] + '.db'
    testing = False
    insp = inspect_mod.stack()
    if 'tests' in str(insp):
        db_name = 'test.db'
        testing = True

    if sc.dict['DBConnection']['type'] == 'sqlite' or testing is True:
        engine = create_engine('sqlite:///%s' % os.path.join(get_db_dir(), db_name))
    elif sc.dict['DBConnection']['type'] == 'mysql':
        try:
            db_str = 'mysql://{}:{}@{}/{}'.format(sc.dict['DBConnection']['username'],
                                                            sc.dict['DBConnection']['password'],
                                                            sc.dict['DBConnection']['server'],
                                                            sc.dict['DBConnection']['database'])
            
        except Exception:
            # db doesn't exist yet, let's create it
            server_str = 'mysql://{}:{}@{}'.format(sc.dict['DBConnection']['username'],
                                                        sc.dict['DBConnection']['password'],
                                                        sc.dict['DBConnection']['server'])
            engine = create_engine(server_str)
            engine.execute('CREATE DATABASE {}'.format(sc.dict['DBConnection']['database']))

        finally:
            # try to get that connection going again
            engine = create_engine(db_str, pool_recycle=3600)
            engine.execute('USE {}'.format(sc.dict['DBConnection']['database']))

    # if we're testing, we want to drop all existing database info to test
    # from scratch
    if testing is True:
        metadata.drop_all(engine)

    # create database schema that doesn't exist
    try:
        metadata.create_all(engine, checkfirst=True)
    except Exception:
        # another service  might be initializing the db,
        # wait a sec for it to be done occurs during
        # docker init
        time.sleep(5)
        metadata.create_all(engine, checkfirst=True)

    engine, Session = db_migration(engine)

    # create scadmin if there are no other users
    session = Session()
    us = session.query(User).filter(User.user_type.like('admin')).all()
    if not us:
        u = User()
        u.username = 'scadmin'
        u.password = generate_password_hash('scadmin', method='pbkdf2:sha512')
        u.user_type = 'ADMIN'
        u.updated = time.time()
        u.updated_by = 'shakecast'
        session.add(u)
        session.commit()
    Session.remove()

    return engine, Session

engine, Session = db_init()