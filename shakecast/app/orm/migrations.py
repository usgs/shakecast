from sqlalchemy import Column, Integer, String, Float

from ..util import SC

############### DB Migrations ################
def migrate_1to2(engine):
    '''
    Add updated and updated_by columns to keep track of which users
    are updating inventory
    '''
    updated = Column('updated', Integer)
    updated_by = Column('updated_by', String)

    try:
        add_column(engine, 'user', updated)
    except Exception:
        pass
    try:
        add_column(engine, 'user', updated_by)
    except Exception:
        pass
    try:
        add_column(engine, 'group', updated)
    except Exception:
        pass
    try:
        add_column(engine, 'group', updated_by)
    except Exception:
        pass
    try:
        add_column(engine, 'facility', updated)
    except Exception:
        pass
    try:
        add_column(engine, 'facility', updated_by)
    except Exception:
        pass
    
    return engine

def migrate_2to3(engine):
    '''
    Add updated and updated_by columns to keep track of which users
    are updating inventory
    '''
    mms = Column('mms', String(255))

    try:
        add_column(engine, 'user', mms)
    except Exception:
        pass

    return engine

def migrate_3to4(engine):
    '''
    Add updated and updated_by columns to keep track of which users
    are updating inventory
    '''
    aebm = Column('aebm', String(50))

    try:
        add_column(engine, 'facility_shaking', aebm)
    except Exception:
        pass

    return engine

def migrate_4to5(engine):

    sent_timestamp = Column('sent_timestamp', Float)
    try:
        add_column(engine, 'notification', sent_timestamp)
    except Exception:
        pass

    return engine

def migrate_5to6(engine):

    type_ = Column('type', String(64))
    try:
        add_column(engine, 'shakemap', type_)
    except Exception:
        pass

    try:
        add_column(engine, 'event', type_)
    except Exception:
        pass

    return engine

def migrate_6to7(engine):

    epicentral_distance = Column('epicentral_distance', String(64))
    try:
        add_column(engine, 'facility_shaking', epicentral_distance)
    except Exception:
        pass

    return engine

def migrate_7to8(engine):

    override_directory = Column('override_directory', String(255))
    try:
        add_column(engine, 'shakemap', override_directory)
    except Exception:
        pass

    try:
        add_column(engine, 'event', override_directory)
    except Exception:
        pass

    return engine

def migrate_8to9(engine):

    product_string = Column('product_string', String(255))
    try:
        add_column(engine, 'group', product_string)
    except Exception:
        pass

    return engine

def add_column(engine, table_name, column):
    '''
    Add a column to an existing table
    '''
    column_name = column.compile(dialect=engine.dialect)
    column_type = column.type.compile(engine.dialect)

    if 'sqlite' in str(engine):
        engine.execute('ALTER TABLE "%s" ADD COLUMN %s %s' % (table_name, column_name, column_type))
    elif 'mysql' in str(engine):
        engine.execute('ALTER TABLE `%s` ADD COLUMN %s %s' % (table_name, column_name, column_type))

#######################################################################

# List of database migrations for export
migrations = [migrate_1to2, migrate_2to3, migrate_3to4, migrate_4to5, migrate_5to6, migrate_6to7]

def migrate(engine):
    '''
    Run all database migrations
    '''
    for migration in migrations:
        engine = migration(engine)

    return engine
