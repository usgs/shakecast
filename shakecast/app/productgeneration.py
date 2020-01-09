import time

from .orm import dbconnect, LocalProduct, LocalProductType, Notification
from .products.geojson import generate_impact_geojson
from .sc_logging import server_logger as logging

REQUIRED_PRODUCTS = ['geojson']

@dbconnect
def create_products(notification=None, session=None):
    '''
    Check for new notifications and generate products for that are still
    missing
    '''
    notification = notification or (session.query(Notification)
            .filter(Notification.status == 'created')
            .filter(Notification.notification_type.like('damage'))
            .first())
    
    if not notification or not notification.shakemap:
        return None

    notification.status = 'generating-products'
    session.commit()

    group = notification.group
    shakemap = notification.shakemap

    logging.info('Removing existing products...')
    for product in shakemap.local_products:
        if product.group == group or product.group is None:
            session.delete(product)
    session.commit()
    logging.info('Done.')

    try:
        logging.info('Generating local products...')

        unfinished_products = get_products(group, shakemap, session=session)
        while len(unfinished_products) > 0:
            finished_products = generate_local_products(unfinished_products, session=session)
            unfinished_products = [product for product in unfinished_products
                    if product not in finished_products]

            if len(unfinished_products) > 0:
                # keep trying to process but take a little break
                logging.info('{} unfinished product(s). Sleeping for 5 seconds and trying again.'.format(len(unfinished_products)))
                time.sleep(5)

    except Exception as e:
        logging.info('Error generating shakemap products for {}-{}: {}'
                .format(shakemap.shakemap_id,
                shakemap.shakemap_version,
                str(e)))

        notification.status = 'error'
        notification.error = str(e)
        session.commit()
        raise

    logging.info('Done generating local products.')
    notification.status = 'ready'
    return notification
    

@dbconnect
def generate_local_products(products, session=None):
    finished_products = []
    for product in products:
        try:
            if (product.finish_timestamp and
                    product.finish_timestamp > product.shakemap.begin_timestamp and
                    product.error is None):
                finished_products += [product]
                continue
        
            if product.check_dependencies() is False and product.tries < 10:
                logging.info('Skipping product, lacking dependencies: {}'
                        .format(str(product)))

                product.tries += 1
                continue
            
            logging.info('Generating product: {}'
                    .format(str(product)))
            product.generate()
            logging.info('Done.')
            product.error = None
        except Exception as e:
            logging.info('Product generation error: {}'.format(str(e)))
            product.error = str(e)

        product.finish_timestamp = time.time()
        session.add(product)
        finished_products += [product]
    session.commit()

    return finished_products

@dbconnect
def get_products(group, shakemap, session=None):
    local_product_names = []
    group_product_names = []
    if group.product_string is not None:
        group_product_names = group.product_string.split(',')
    
    local_product_names += REQUIRED_PRODUCTS
    local_product_names += group_product_names
    
    product_types = session.query(LocalProductType).filter(
        LocalProductType.name.in_(local_product_names)).all()

    product_types = get_all_required_products(product_types, session)
    products = []
    for product_type in product_types:
        product_group = (group if product_type.name in group_product_names
                else None)
        # check if product exists
        product = (session.query(LocalProduct)
                .filter(LocalProduct.group == product_group)
                .filter(LocalProduct.shakemap == shakemap)
                .filter(LocalProduct.product_type == product_type).first())

        if not product:
            product = LocalProduct(
                group=product_group,
                shakemap=shakemap,
                product_type=product_type
            )

            product.name = (product_type.file_name or
                    '{}_impact.{}'.format(group.name, product_type.type))
        
        products += [product]
    
    return products

@dbconnect
def get_all_required_products(product_types, session=None):
    '''
    Collect the the dependencies required to produce these product types
    '''
    all_required_products = []
    for product_type in product_types:
        if not product_type or product_type in all_required_products:
            continue

        all_required_products += [product_type]
        if product_type.dependencies is not None:
            dependency_names = product_type.dependencies.split(',')
            for dependency in dependency_names:
                product_type = (session.query(LocalProductType)
                        .filter(LocalProductType.name == dependency)
                        .first())

                if product_type and product_type not in all_required_products:
                    all_required_products += get_all_required_products([product_type], session)

    return list(set(all_required_products))
