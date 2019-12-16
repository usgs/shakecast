import time

from .orm import dbconnect, LocalProduct, LocalProductType, Notification
from .products.geojson import generate_impact_geojson
from .sc_logging import server_logger as logging

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

    try:
        # generate system level products
        logging.info('Generating geojson product...')
        generate_impact_geojson(shakemap, save=True)
        logging.info('Done.')
    except Exception as e:
        logging.info('Error generating geojson for {}-{}: {}'
                .format(shakemap.shakemap_id,
                shakemap.shakemap_version,
                str(e)))

        notification.status = 'error'
        notification.error = str(e)
        raise

    try:
        logging.info('Generating required local products...')
        generate_local_products(group, shakemap, session=session)
    except Exception as e:
        logging.info('Error generating shakemap products for {}-{}: {}'
                .format(shakemap.shakemap_id,
                shakemap.shakemap_version,
                str(e)))

        notification.status = 'error'
        notification.error = str(e)
        session.commit()
        raise

    notification.status = 'ready'
    return notification
    

@dbconnect
def generate_local_products(group, shakemap, session=None):
    logging.info('Generating local products...')
    if group.product_string is not None:
        local_product_names = group.product_string.split(',')
        product_types = session.query(LocalProductType).filter(
            LocalProductType.name.in_(local_product_names)).all()

        for product_type in product_types:
            # check if product exists
            product = (session.query(LocalProduct)
                    .filter(LocalProduct.group == group)
                    .filter(LocalProduct.shakemap == shakemap)
                    .filter(LocalProduct.product_type == product_type).first())

            if not product:
                product = LocalProduct(
                    group=group,
                    shakemap=shakemap,
                    product_type=product_type
                )

                product.name = (product_type.file_name or
                        '{}_impact.{}'.format(group.name, product_type.type))

            try:
                if (product.finish_timestamp and
                        product.finish_timestamp > product.shakemap.begin_timestamp):
                    continue
                
                logging.info('Generating product: {}, for shakemap: {}-{}, for group: {}'
                        .format(product.product_type.name, shakemap.shakemap_id, shakemap.shakemap_version, group.name))
                product.generate()
                logging.info('Done.')
                product.error = None
            except Exception as e:
                logging.info('Product generation error: {}'.format(str(e)))
                product.error = str(e)

            logging.info('Done generating products.')
            product.finish_timestamp = time.time()
            session.add(product)
        session.commit()
