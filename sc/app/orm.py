from util import *
import os
import sys
import inspect as inspect_mod

modules_dir = os.path.join(sc_dir(), 'modules')
if modules_dir not in sys.path:
    sys.path += [modules_dir]
    
app_dir = os.path.join(sc_dir(), 'app')
if app_dir not in sys.path:
    sys.path += [app_dir]

from sqlalchemy import *
from sqlalchemy.ext.declarative import *
from sqlalchemy.ext.hybrid import hybrid_method
from sqlalchemy.orm import *
from sqlalchemy.sql import and_, or_
from werkzeug.security import generate_password_hash

# Get directory location for database
path = os.path.dirname(os.path.abspath(__file__))
delim = get_delim()
path = path.split(delim)
path[-1] = 'db'
directory = delim.join(path)

# create a metadata object
metadata = MetaData()

# create a bass class. All mapped class will derive from bass class
Base = declarative_base(metadata=metadata)

#######################################################################
########################## Facility Tables ############################
class Facility(Base):
    __tablename__ = 'facility'
    shakecast_id = Column(Integer, primary_key=True)
    facility_id = Column(Integer)
    facility_type = Column(String(25))
    component = Column(String(100))
    component_class = Column(String(100))
    name = Column(String(255))
    short_name = Column(String(20))
    description = Column(String(255))
    html = Column(String())
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
    updated_by = Column(String)
    
    shaking_history = relationship('Facility_Shaking',
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
    
    
    def make_alert_level(self, shaking_point=None, shakemap=None, notifications=None):
        '''
        Create a dictionary that contains all the information for a
        Facility_Shaking entry in the database
        '''
        shaking_level = shaking_point[self.metric]
        
        # check if there is already shaking for this shakemap and facility
        stmt = (select([Facility_Shaking.__table__.c.shakecast_id])
                        .where(and_(Facility_Shaking.__table__.c.facility_id == self.shakecast_id,
                                    Facility_Shaking.__table__.c.shakemap_id == shakemap.shakecast_id)))
        result = engine.execute(stmt)
        fac_shake_id = [row for row in result]
        
        
        fac_shake = {'gray': 0,
                     'green': 0,
                     'yellow': 0,
                     'orange': 0,
                     'red': 0,
                     'metric': None,
                     'facility_id': 0,
                     'shakemap_id': 0,
                     '_shakecast_id': 0,
                     'update': '',
                     'alert_level': '',
                     'weight': 0,
                     'MMI': 0,
                     'PGA': 0,
                     'PSA03': 0,
                     'PSA10': 0,
                     'PSA30': 0,
                     'PGV': 0}

        if notifications is not None:
            fac_shake['notifications'] = [''] * len(notifications)
        
        if shaking_level is None:
            fac_shake['alert_level'] = None
        
        else:
            # add shaking levels to fac_shake:
            for metric in shaking_point.keys():
                fac_shake[metric] = shaking_point[metric]
            
            # if shaking exists for this facility for this shakemap
            # assign it's shakecast_id, otherwise it will get assigned
            # later
            if fac_shake_id:
                #fac_shake = Facility_Shaking()
                fac_shake['update'] = True
                fac_shake['_shakecast_id'] = fac_shake_id[0][0]
            else:
                fac_shake['update'] = False
                fac_shake['_shakecast_id'] = 0
                
            # get_exceedence green
            fragility = [{'med': self.red, 'spread': self.red_beta, 'level': 'red', 'rank': 4},
                         {'med': self.orange, 'spread': self.orange_beta, 'level': 'orange', 'rank': 3},
                         {'med': self.yellow, 'spread': self.yellow_beta, 'level': 'yellow', 'rank': 2},
                         {'med': self.green, 'spread': self.green_beta, 'level': 'green', 'rank': 1}]
                        
            prob_sum = 0
            large_prob = 0
            for level in fragility:
                
                if level['med'] < 0 or level['spread'] < 0:
                    continue
                
                p = lognorm_opt(med=level['med'],
                                spread=level['spread'],
                                shaking=shaking_level)
                
                p -= prob_sum
                prob_sum += p
                fac_shake[level['level']] = p
                
                if p > large_prob:
                    large_prob = p
                    fac_shake['alert_level'] = level['level']
                    fac_shake['weight'] = level['rank'] + (p / 100)
                    
            fac_shake['gray'] = 100 - prob_sum
            if fac_shake['gray'] > large_prob:
                fac_shake['alert_level'] = 'gray'
                fac_shake['weight'] = (fac_shake['gray'] / 100)
                
        fac_shake['facility_id'] = self.shakecast_id
        fac_shake['metric'] = self.metric
        fac_shake['shakemap_id'] = shakemap.shakecast_id
        
        not_count = 0
        if notifications is not None:
            for notification in notifications:
                if notification.group in self.groups:
                    fac_shake['notifications'][not_count] = notification
                    not_count += 1
        
        return fac_shake

 
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
  
    
class Facility_Shaking(Base):
    __tablename__ = 'facility_shaking'
    shakecast_id = Column(Integer, primary_key=True)
    shakemap_id = Column(Integer, ForeignKey('shakemap.shakecast_id'))
    facility_id = Column(Integer, ForeignKey('facility.shakecast_id'))
    notification_id = Column(Integer, ForeignKey('notification.shakecast_id'))
    metric = Column(String(20))
    alert_level = Column(String(20))
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
    
    def __repr__(self):
        return '''Facility_Shaking(shakemap_id=%s,
                                   facility_id=%s,
                                   notification_id=%s,
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
                                                   self.notification_id,
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
                                   
    def __str__(self):
        return ""
    
    
#######################################################################
######################## Notification Tables ##########################

class Notification(Base):
    __tablename__ = 'notification'
    shakecast_id = Column(Integer, primary_key=True)
    shakemap_id = Column(Integer, ForeignKey('shakemap.shakecast_id'))
    event_id = Column(Integer, ForeignKey('event.event_id'))
    group_name = Column(String(25), ForeignKey('group.name'))
    notification_type = Column(String(25))
    status = Column(String(15))
    notification_file = Column(String(255))
    
    facility_shaking = relationship('Facility_Shaking',
                                    secondary='shaking_notification_connection',
                                    backref='notifications')
    
    def __rept__(self):
        return '''Notification(shakemap_id=%s,
                               group_name=%s,
                               notification_type=%s,
                               status=%s,
                               notification_file=%s)''' % (self.shakemap_id,
                                                             self.group_name,
                                                             self.notification_type,
                                                             self.status,
                                                             self.notification_file)
    
      
class User(Base):
    __tablename__ = 'user'
    shakecast_id = Column(Integer, primary_key=True)
    username = Column(String(32))
    password = Column(String(64))
    email = Column(String(255))
    phone_number = Column(String(25))
    full_name = Column(String(32))
    user_type = Column(String(10))
    group_string = Column(String())
    updated = Column(Integer)
    updated_by = Column(String)

    groups = relationship('Group',
                          secondary='user_group_connection',
                          backref='users')
    
    def __repr__(self):
        return '''User(username=%s,
                       password=%s,
                       email=%s,
                       phone_number=%s,
                       full_name=%s,
                       user_type=%s)''' % (self.username,
                                           self.password,
                                           self.email,
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
    updated_by = Column(String)
    
    facilities = relationship('Facility',
                              secondary='facility_group_connection',
                              backref='groups')
    
    past_notifications = relationship('Notification',
                                      backref='group',
                                      cascade='save-update, delete')
    
    specs = relationship('Group_Specification',
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
    
    @hybrid_method    
    def has_spec(self, not_type=''):
        specs = [s.notification_type.lower() for s in self.specs]
        event_types = [s.event_type.lower() for s in self.specs]
        return bool(not_type.lower() in specs + event_types)
        
    @has_spec.expression   
    def has_spec(cls, not_type=''):
        specs = [s.notification_type.lower() for s in cls.specs]
        event_types = [s.event_type.lower() for s in cls.specs]
        if not_type.lower() in specs + event_types:
            return 1 == 1
        else:
            return 0 == 1

    def has_alert_level(self, level):
        levels = [s.inspection_priority.lower() for s in self.specs if 
                                s.notification_type == 'DAMAGE']

        # need to match grey and gray... we use gray in pyCast, but
        # workbook and V3 use grey
        if 'grey' in levels and level.lower() == 'gray':
            return True

        return level.lower() in levels

class Group_Specification(Base):
    __tablename__ = 'group_specification'
    shakecast_id = Column(Integer, primary_key=True)
    group_id = Column(String(25), ForeignKey('group.shakecast_id'))
    notification_type = Column(String(25))
    event_type = Column(String(25))
    inspection_priority = Column(String(10))
    minimum_magnitude = Column(Integer)
    notification_format = Column(String(25))
    aggregate_name = Column(String(25))
    
    def __repr__(self):
        return '''Group_Specification(group_id=%s,
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

shaking_notification_connection = Table('shaking_notification_connection', Base.metadata,
    Column('facility_shaking',
           Integer,
           ForeignKey('facility_shaking.shakecast_id',
                      ondelete='cascade'),
           primary_key=True),
    Column('notification',
           Integer,
           ForeignKey('notification.shakecast_id',
                      ondelete='cascade'),
           primary_key=True)
)

#######################################################################
######################### Earthquake Tables ###########################

class Event(Base):
    __tablename__ = 'event'
    shakecast_id = Column(Integer, primary_key=True)
    event_id = Column(String(20))
    status = Column(String(20))
    all_event_ids = Column(String(20))
    lat = Column(Float)
    lon = Column(Float)
    depth = Column(Float)
    magnitude = Column(Float)
    title = Column(String)
    place = Column(String)
    time = Column(Integer)
    directory_name = Column(String)
    
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
    status = Column(String(10))
    map_status = Column(String(10))
    event_version = Column(Integer)
    generating_server = Column(Integer)
    region = Column(String(10))
    lat_min = Column(Float)
    lat_max = Column(Float)
    lon_min = Column(Float)
    lon_max = Column(Float)
    generation_timestamp = Column(String(32))
    recieve_timestamp = Column(String(32))
    begin_timestamp = Column(String(20))
    end_timestamp = Column(String(20))
    superceded_timestamp = Column(String(20))
    directory_name = Column(String(255))
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

    facility_shaking = relationship('Facility_Shaking',
                                    backref='shakemap',
                                    order_by='Facility_Shaking.weight.desc()',
                                    cascade='save-update, delete')
    
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
        
        if shakemaps:
            return False
        else:
            return True
           
    def has_products(self, req_prods):
        shakemap_prods = [prod.product_type for prod in self.products]
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
    
class Product(Base):
    __tablename__ = 'product'
    shakecast_id = Column(Integer, primary_key=True)
    shakemap_id = Column(Integer,
                         ForeignKey('shakemap.shakecast_id'))
    product_type = Column(String(10))
    name = Column(String(32))
    description = Column(String(255))
    metric = Column(String(10))
    filename = Column(String(32))
    url = Column(String(255))
    display = Column(Integer)
    source = Column(String(64))
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

# name the database, but switch to a test database if run from test.py
db_name = 'shakecast.db'
testing = False
insp = inspect_mod.stack()
for stack in insp:
    for entry in stack:
        if 'test.py' in str(entry):
            db_name = 'test.db'
            testing = True
        
# logging from DB
#logging.basicConfig(level=logging.DEBUG)
#logging.getLogger('sqlalchemy.engine.base').setLevel(logging.DEBUG)

# SETUP DATABASE
engine = create_engine('sqlite:///%s' % os.path.join(directory, db_name))
#connection = engine.connect()

# if we're testing, we want to drop all existing database info to test
# from scratch
if testing is True:
    drop_sql = metadata.drop_all(engine)

# create database schema that doesn't exist
db_sql = metadata.create_all(engine)

# In SQLalchemy we always work with RELATED objects
# all the objects we're working with are stored in a session
session_maker = sessionmaker(bind=engine)
Session = scoped_session(session_maker)

############# Check for required DB migrations #############
def db_migration():
    from db_migrations import migrations
    from util import SC
    sc = SC()
    for migration in migrations:
        mig_version = int(migration.__name__.split('to')[1])
        cur_version = sc.dict['Server']['update']['db_version']
        if mig_version > cur_version:
            # run the migration
            migration(engine)
            # update the configs
            sc.dict['Server']['update']['db_version'] = mig_version
    sc.save_dict()
db_migration()

# create scadmin if there are no other users
session = Session()
us = session.query(User).filter(User.user_type.like('admin')).all()
if not us:
    u = User()
    u.username = 'scadmin'
    u.password = generate_password_hash('scadmin', method='pbkdf2:sha512')
    u.user_type = 'ADMIN'
    session.add(u)
    session.commit()
Session.remove()

