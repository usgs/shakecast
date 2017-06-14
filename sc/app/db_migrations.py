from objects import SC
############### DB Migrations ################
def migrate_1to2(engine):
    '''
    Add updated and updated_by columns to keep track of which users
    are updating inventory
    '''
    updated = Column('updated', Integer)
    updated_by = Column('updated_by', String)
    
    user_columns = [c.key for c in User.__table__.columns]
    group_columns = [c.key for c in Group.__table__.columns]
    facility_columns = [c.key for c in Facility.__table__.columns]

    if not 'updated' in user_columns:
        add_column(engine, 'user', updated)
    if not 'updated_by' in user_columns:
        add_column(engine, 'user', updated_by)

    if not 'updated' in group_columns:
        add_column(engine, 'group', updated)
    if not 'updated_by' in group_columns:
        add_column(engine, 'group', updated_by)

    if not 'updated' in facility_columns:
        add_column(engine, 'facility', updated)
    if not 'updated_by' in facility_columns:
        add_column(engine, 'facility', updated_by)

def add_column(engine, table_name, column):
    '''
    Add a column to an existing table
    '''
    column_name = column.compile(dialect=engine.dialect)
    column_type = column.type.compile(engine.dialect)
    engine.execute('ALTER TABLE %s ADD COLUMN %s %s' % (table_name, column_name, column_type))

# List of database migrations for export
migrations = [migrate_1to2]