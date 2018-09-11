from orm import User, Group, Facility, Column, Integer, String
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

# List of database migrations for export
migrations = [migrate_1to2, migrate_2to3, migrate_3to4]
