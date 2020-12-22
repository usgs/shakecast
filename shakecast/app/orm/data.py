import time
from werkzeug.security import generate_password_hash

from .objects import LocalProductType, User
from .utils import dbconnect

local_product_types = [
    {
        'type': 'csv',
        'generate_function': 'summary_csv',
        'read_type': 'r',
        'write_type': 'w',
        'name': 'csv',
        'file_name': 'FacilityImpacts.csv'
    },
    {
        'type': 'csv',
        'generate_function': 'sc_csv',
        'read_type': 'r',
        'name': 'group_csv',
        'write_type': 'w'
    },
    {
        'type': 'pdf',
        'generate_function': 'pdf',
        'read_type': 'rb',
        'write_type': 'wb',
        'name': 'pdf',
        'subtype': 'pdf',
        'dependencies': 'geojson_html'
    },
    {
        'type': 'json',
        'generate_function': 'geojson',
        'read_type': 'r',
        'name': 'geojson',
        'write_type': 'w',
        'file_name': 'impact.json'
    },
    {
        'type': 'html',
        'generate_function': 'geojsonhtml',
        'read_type': 'r',
        'name': 'geojson_html',
        'write_type': 'w',
        'file_name': 'impact_capture.html',
        'dependencies': 'geojson'
    }
]

sc_admin = {
    'username': 'scadmin',
    'password': generate_password_hash('scadmin', method='pbkdf2:sha512'),
    'user_type': 'ADMIN',
    'updated': time.time(),
    'updated_by': 'shakecast'
}


@dbconnect
def load_data(session=None):
    # add product types
    for product_type in local_product_types:
        try:
          local_product_type = LocalProductType(**product_type)
          session.add(local_product_type)
          session.commit()
        except Exception as e:
          session.rollback()

    # add scadmin
    users = session.query(User).filter(User.user_type.like('admin')).all()
    if len(users) == 0:
        user = User(**sc_admin)
        session.add(user)
        session.commit()

