import time
from werkzeug.security import generate_password_hash

from .objects import LocalProductType, User
from .utils import dbconnect

local_product_types = [
    LocalProductType(
        type='csv',
        generate_function='sc_csv',
        read_type='r',
        write_type='w'
    ),
    LocalProductType(
        type='pdf',
        generate_function='pdf',
        read_type='rb',
        write_type='wb',
        subtype='pdf'
    )
]

sc_admin = User(
    username='scadmin',
    password=generate_password_hash('scadmin', method='pbkdf2:sha512'),
    user_type='ADMIN',
    updated=time.time(),
    updated_by='shakecast'
)


@dbconnect
def load_data(session=None):
    add_data = []

    # add product types
    for product_type in local_product_types:
        existing_type = session.query(LocalProductType).filter(
            LocalProductType.type == product_type.type).first()

        if existing_type:
            continue
        else:
            add_data.append(product_type)

    # add scadmin
    users= session.query(User).filter(User.user_type.like('admin')).all()
    if len(users) == 0:
        add_data.append(sc_admin)
    
    session.bulk_save_objects(add_data)
    session.commit()
