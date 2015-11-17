from sqlalchemy import *
import logging
from sqlalchemy.ext.declarative import *
from sqlalchemy.ext.hybrid import hybrid_method
from sqlalchemy.orm import *
from sqlalchemy.sql import and_, or_, not_
import os
from helper_functions import *

# Get directory location for database
path = os.path.dirname(os.path.abspath(__file__))
delim = get_delim()
path = path.split(delim)
path[-2] = 'db'
del path[-1]
directory = delim.join(path) + delim

db_name = 'shakecast_test_db.db'

# logging from DB
#logging.basicConfig(level=logging.DEBUG)
#logging.getLogger('sqlalchemy.engine.base').setLevel(logging.DEBUG)

# SETUP DATABASE
engine = create_engine('sqlite:///%s%s' % (directory, db_name))
connection = engine.connect()


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
    name = Column(String(255))
    short_name = Column(String(20))
    description = Column(String(255))
    lat_min = Column(Float)
    lat_max = Column(Float)
    lon_min = Column(Float)
    lon_max = Column(Float)
    grey = Column(Float)
    green = Column(Float)
    yellow = Column(Float)
    orange = Column(Float)
    red = Column(Float)
    grey_alpha = Column(Float)
    green_alpha = Column(Float)
    yellow_alpha = Column(Float)
    orange_alpha = Column(Float)
    red_alpha = Column(Float)
    metric = Column(String(20))
    
    shaking_history = relationship('Facility_Shaking',
                        backref='facility',
                        cascade='save-update, delete')

    def make_alert_level(self, shaking_level=0, shakemap=None):
        # check if there is already shaking for this shakemap and facility
        fac_shake = (session.query(Facility_Shaking)
                            .filter(Facility_Shaking.facility == self)
                            .filter(Facility_Shaking.shakemap == shakemap)
                            .all())
        
        # if the query has results, assign them to shaking, otherwise,
        # create a new instance
        if fac_shake:
            fac_shake = fac_shake[0]
        else:
            fac_shake = Facility_Shaking()
            
        # get_exceedence green
        fragility = [{'med': self.red, 'spread': self.red_alpha, 'level': 'red'},
                     {'med': self.orange, 'spread': self.orange_alpha, 'level': 'orange'},
                     {'med': self.yellow, 'spread': self.yellow_alpha, 'level': 'yellow'},
                     {'med': self.green, 'spread': self.green_alpha, 'level': 'green'},
                     {'med': self.grey, 'spread': self.grey_alpha, 'level': 'grey'}]
        
        prob_sum = 0
        large_prob = 0
        for level in fragility:
            prob, shaking = lognorm(med=level['med'],
                                    spread=level['spread'])
            shaking_index = closest(shaking, shaking_level)
            p = prob[shaking_index]
            
            p -= prob_sum
            prob_sum += p
            
            setattr(fac_shake, level['level'], p)
            
            if p > large_prob:
                large_prob = p
                alert_level = level['level']
            
        fac_shake.facility = self
        fac_shake.shakemap = shakemap
        fac_shake.metric = self.metric
        fac_shake.alert_level = alert_level
        
        #notification.facility_shaking.append(fac_shake)
        session.merge(fac_shake)
        session.commit()
        
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
    grey = Column(Float)
    green = Column(Float)
    yellow = Column(Float)
    orange = Column(Float)
    red = Column(Float)
    
    shakemap = relationship('ShakeMap',
                            backref='facilities_affected',
                            foreign_keys=[shakemap_id],
                            cascade='all')
    
    __table_args__ = (UniqueConstraint('facility_id', 'shakemap_id', name='shaking_uc'),
                     )
    
#######################################################################
######################## Notification Tables ##########################

class Notification(Base):
    __tablename__ = 'notification'
    shakecast_id = Column(Integer, primary_key=True)
    shakemap_id = Column(Integer, ForeignKey('shakemap.shakecast_id'))
    group_name = Column(String(25), ForeignKey('group.name'))
    notification_type = Column(String(25))
    status = Column(String(15))
    notification_file = Column(String(255))
    
    group = relationship('Group',
                         backref='past_notifications')
    
    facility_shaking = relationship('Facility_Shaking',
                                    secondary='shaking_notification_connection',
                                    backref='notifications',
                                    cascade='save-update, delete')
    
    shakemap = relationship('ShakeMap',
                            backref = 'notifications',
                            foreign_keys=[shakemap_id])
    
    
class User(Base):
    __tablename__ = 'user'
    username = Column(String(32), primary_key=True)
    password = Column(String(64))
    email = Column(String(255))
    phone_number = Column(String(25))
    full_name = Column(String(32))
    user_type = Column(String(10))
    
    groups = relationship('Group',
                          secondary='user_group_connection',
                          backref='users')
  
    
class Group(Base):
    __tablename__ = 'group'
    name = Column(String(25), primary_key=True)
    facility_type = Column(String(25))
    lon_min = Column(Integer)
    lon_max = Column(Integer)
    lat_min = Column(Integer)
    lat_max = Column(Integer)
    template = Column(String(255))
    notification_count = Column(Integer)
    
    facilities = relationship('Facility',
                              secondary='facility_group_connection',
                              backref='groups')
    
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
    

class Group_Specifications(Base):
    __tablename__ = 'group_specifications'
    group_specifications_id = Column(Integer, primary_key=True)
    group_name = Column(String(25), ForeignKey('group.name'))
    notifiation_type = Column(String(25))
    inspection_priority = Column(String(10))
    minimum_magnitude = Column(Integer)
    notification_format = Column(String(25))
    aggregate_name = Column(String(25))
    
    group = relationship('Group', backref='specifications', foreign_keys=[group_name])

# Connection tables
user_group_connection = Table('user_group_connection', Base.metadata,
    Column('username', Integer, ForeignKey('user.username'), primary_key=True),
    Column('group', Integer, ForeignKey('group.name'), primary_key=True)
)

facility_group_connection = Table('facility_group_connection', Base.metadata,
    Column('facility', Integer, ForeignKey('facility.shakecast_id'), primary_key=True),
    Column('group', Integer, ForeignKey('group.name'), primary_key=True)
)

shaking_notification_connection = Table('shaking_notification_connection', Base.metadata,
    Column('shaking', Integer, ForeignKey('facility_shaking.shakecast_id'), primary_key=True),
    Column('notification', Integer, ForeignKey('notification.shakecast_id'), primary_key=True)
)

user_notification_connection = Table('user_notification_connection', Base.metadata,
    Column('username', Integer, ForeignKey('user.username'), primary_key=True),
    Column('notification', Integer, ForeignKey('notification.shakecast_id'), primary_key=True)
)

#######################################################################
########################## ShakeMap Tables ############################

class ShakeMap(Base):
    __tablename__ = 'shakemap'
    shakecast_id = Column(Integer, primary_key=True)
    shakemap_id = Column(String(80))
    shakemap_version = Column(Integer)
    status = Column(String(10))
    event_id = Column(String(80))
    event_version = Column(Integer)
    generating_server = Column(Integer)
    region = Column(String(2))
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
    
    products = relationship('Product',
                        backref='shakemap',
                        cascade='save-update, delete')
    
    @hybrid_method    
    def is_new(self):
        shakemaps = (
            session.query(ShakeMap)
                   .filter(ShakeMap.shakemap_id == self.shakemap_id)
                   .filter(ShakeMap.shakemap_version == self.shakemap_version)
                   .all()
        )
        
        if shakemaps:
            return False
        else:
            return True
        
    @hybrid_method    
    def has_products(self, req_prods):
        shakemap_prods = [prod.product_type for prod in self.products]
        for prod in req_prods:
            if prod not in shakemap_prods:
                return False
        return True
    
    
class Product(Base):
    __tablename__ = 'product'
    shakecast_id = Column(Integer, primary_key=True)
    shakemap_id = Column(Integer,
                         ForeignKey('shakemap.shakecast_id'))
    #shakemap_version = Column(Integer, ForeignKey('shakemap.version'), primary_key=True)
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
    
    
#######################################################################

# create database schema that doesn't exist
metadata.create_all(engine)

# In SQLalchemy we always work with RELATED objects
# all the objects we're working with are stored in a session
Session = sessionmaker(bind=engine)
session = Session()
    
