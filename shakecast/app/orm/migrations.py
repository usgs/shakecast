from sqlalchemy import Column, Integer, String, Float, PrimaryKeyConstraint

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

def migrate_9to10(engine):

    generated_timestamp = Column('generated_timestamp', Float)
    try:
        add_column(engine, 'notification', generated_timestamp)
    except Exception:
        pass

    return engine

def migrate_10to11(engine):

    file_name = Column('file_name', String)
    try:
        add_column(engine, 'local_product_types', file_name)
    except Exception:
        pass

    name = Column('name', String)
    try:
        add_column(engine, 'local_product_types', name)
    except Exception:
        pass

    try:
        engine.execute('drop table local_product_types')
    except Exception:
        pass

    begin_timestamp = Column('begin_timestamp', Float)
    try:
        add_column(engine, 'local_products', begin_timestamp)
    except Exception:
        pass
    
    finish_timestamp = Column('finish_timestamp', Float, default=0)
    try:
        add_column(engine, 'local_products', finish_timestamp)
    except Exception:
        pass

    error = Column('error', String(255))
    try:
        add_column(engine, 'notification', error)
    except Exception:
        pass

    return engine


def migrate_11to12(engine):
    update = Column('updated', Integer)
    try:
        add_column(engine, 'event', update)
    except Exception:
        pass

    return engine

def migrate_12to13(engine):
    dependencies = Column('dependencies', String)
    tries = Column('tries', Integer, default=0)
    try:
        add_column(engine, 'local_product_types', dependencies)
    except Exception:
        pass
    try:
        add_column(engine, 'local_products', tries)
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
migrations = [migrate_1to2, migrate_2to3, migrate_3to4, migrate_4to5,
        migrate_5to6, migrate_6to7, migrate_7to8, migrate_8to9, migrate_9to10,
        migrate_10to11, migrate_11to12, migrate_12to13]

def migrate(engine):
    '''
    Run all database migrations
    '''
    for migration in migrations:
        engine = migration(engine)

    return engine
