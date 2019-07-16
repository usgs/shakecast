from email.mime.text import MIMEText
from email.mime.image import MIMEImage
from email.mime.multipart import MIMEMultipart
from email.mime.application import MIMEApplication
from jinja2 import Template, Environment
import json
import os
import shutil
import time

from .builder import NotificationBuilder
from .mailer import Mailer
from ..orm import dbconnect, ShakeMap
from .templates import TemplateManager
from ..util import sc_dir, SC, get_template_dir, split_string_on_spaces

jinja_env = Environment(extensions=['jinja2.ext.do'])



def get_image(image_path):
    default_image = os.path.join(sc_dir(),'view','assets', 'sc_logo.png')
    try:
        image = open(image_path, 'rb')
    except Exception:
        image = open(default_image, 'rb')

    return image


def new_event_notification(notifications=None,
                           scenario=False):
    """
    Build and send HTML email for a new event or scenario
    
    Args:
        event (ShakeMap): which ShakeMap the Notification is attached to
        group (Group): The Group that this Notification is being send to
        notification (Notification): The Notification that will be sent
        scenario (bool): True if the user is running a scenario
        
    Returns:
        None
    """
    events = [n.event for n in notifications]
    group = notifications[0].group
    notification = notifications[0]
    
    # aggregate multiple events
    for n in notifications[1:]:
        n.status = 'aggregated'

    # create HTML for the event email
    not_builder = NotificationBuilder()
    message = not_builder.build_new_event_html(events=events, notification=notification, name=group.template)
    
    notification.status = 'Message built'

    #initiate message
    msg = MIMEMultipart()
    
    # attach html
    message_type = 'html' if '<html>' in message else 'plain'
    encoded_message = MIMEText(message.encode('utf-8'), message_type, 'utf-8')
    msg.attach(encoded_message)

    # get and attach map
    for count,event in enumerate(events):
        map_image = get_image(os.path.join(event.directory_name,
                                    'image.png'))

        msg_gmap = MIMEImage(map_image.read(), _subtype='png')
        map_image.close()
        
        msg_gmap.add_header('Content-ID', '<gmap{0}_{1}>'.format(count, notification.shakecast_id))
        msg_gmap.add_header('Content-Disposition', 'inline')
        msg.attach(msg_gmap)
    
    # find the ShakeCast logo
    temp_manager = TemplateManager()
    configs = temp_manager.get_configs('new_event', 
                                        name=notification.group.template)
    logo_str = os.path.join(sc_dir(),'view','assets',configs['logo'])
    
    # open logo and attach it to the message
    logo_file = get_image(logo_str)
    msg_image = MIMEImage(logo_file.read(), _subtype='png')
    logo_file.close()
    msg_image.add_header('Content-ID', '<sc_logo_{0}>'.format(notification.shakecast_id))
    msg_image.add_header('Content-Disposition', 'inline')
    msg.attach(msg_image)
    
    mailer = Mailer()
    me = mailer.me

    # get notification format
    not_format = group.get_notification_format(notification, scenario)

    # get notification destination based on notification format
    you = [user.__dict__[not_format] for user in group.users
            if user.__dict__.get(not_format, False)]
    
    if len(you) > 0:
        if len(events) == 1:
            subject = event.title.encode('utf-8')
        else:
            mags = []
            for e in events:
                if e.event_id == 'heartbeat':
                    mags += ['None']
                else:
                    mags += [e.magnitude]
                    
            subject = '{0} New Events -- Magnitudes: {1}'.format(len(events),
                                                                        str(mags).replace("'", ''))
        
        if scenario is True:
            subject = 'SCENARIO: ' + subject

        msg['Subject'] = subject
        msg['To'] = ', '.join(you)
        msg['From'] = me
        
        mailer.send(msg=msg, you=you)
        
        notification.status = 'sent'
        notification.sent_timestamp = time.time()
        
    else:
        notification.status = 'not sent - no users'

@dbconnect
def inspection_notification(notification=None,
                            scenario=False,
                            session=None):
    '''
    Create local products and send inspection notification
    
    Args:
        notification (Notification): The Notification that will be sent

    Returns:
        None
    '''
    shakemap = notification.shakemap
    group = notification.group
    error = ''

    has_alert_level, new_inspection, update = check_notification_for_group(
        group,
        notification,
        session=session,
        scenario=scenario
    )

    if has_alert_level and new_inspection:
        try:
            #initiate message
            msg = MIMEMultipart()

            # build the notification
            not_builder = NotificationBuilder()
            message = not_builder.build_insp_html(shakemap, notification=notification, name=group.template)

            # attach html
            message_type = 'html' if '<html>' in message else 'plain'
            encoded_message = MIMEText(message.encode('utf-8'), message_type, 'utf-8')
            msg.attach(encoded_message)

            # check for and attach local products
            for product in shakemap.local_products:
                if product.error:
                    continue

                try:
                    content = product.read()
                    attach_product = MIMEApplication(content, _subtype=product.product_type.subtype)
                    attach_product.add_header('Content-Disposition', 'attachment', filename=product.name)
                    msg.attach(attach_product)
                except Exception as e:
                    product.error = 'Unable to attach to email'

            # get and attach shakemap
            msg_shakemap = MIMEImage(shakemap.get_map(), _subtype='jpeg')
            msg_shakemap.add_header('Content-ID', '<shakemap{0}>'.format(shakemap.shakecast_id))
            msg_shakemap.add_header('Content-Disposition', 'inline')
            msg.attach(msg_shakemap)
            
            # find the ShakeCast logo
            temp_manager = TemplateManager()
            configs = temp_manager.get_configs('inspection',
                                        name=notification.group.template)
            logo_str = os.path.join(sc_dir(),'view','assets',configs['logo'])
            
            # open logo and attach it to the message
            logo_file = open(logo_str, 'rb')
            msg_image = MIMEImage(logo_file.read())
            logo_file.close()
            msg_image.add_header('Content-ID', '<sc_logo{0}>'.format(shakemap.shakecast_id))
            msg_image.add_header('Content-Disposition', 'inline')
            msg.attach(msg_image)
            
            mailer = Mailer()
            me = mailer.me

            # get notification format
            not_format = group.get_notification_format(notification, scenario)

            # get notification destination based on notification format
            you = [user.__dict__[not_format] for user in group.users
                    if user.__dict__.get(not_format, False)]
            
            if len(you) > 0:
                subject = '{0} {1}'.format('Inspection - ', shakemap.event.title)

                if scenario is True:
                    subject = 'SCENARIO: ' + subject
                elif update is True:
                    subject = 'UPDATE: ' + subject
                    

                msg['Subject'] = subject
                msg['To'] = ', '.join(you)
                msg['From'] = me
                
                mailer.send(msg=msg, you=you)
                
                notification.status = 'sent'
                notification.sent_timestamp = time.time()

            else:
                notification.status = 'not sent - no users'
        except Exception as e:
            error = str(e)
            notification.status = 'send failed'
            
    elif new_inspection:
        notification.status = 'not sent: low inspection priority'
    else:
        notification.status = 'not sent: update without impact changes'

    return {'status': notification.status,
            'error': error}

@dbconnect
def check_notification_for_group(group, notification, session=None, scenario=False):
    shakemap = notification.shakemap

    # Check that the inspection status merits a sent notification
    alert_level = shakemap.get_alert_level()

    # check if inspection list has changed
    new_inspection = True
    update = False
    if shakemap.old_maps():
        update = True
        new_inspection = False

        # get the most recent map version
        previous_map = (session.query(ShakeMap)
            .filter(ShakeMap.shakemap_id == shakemap.shakemap_id)
            .filter(ShakeMap.shakemap_version < shakemap.shakemap_version)
            .order_by(ShakeMap.shakemap_version.desc())
        ).first()

        prev_alert_level = previous_map.get_alert_level()

        # ignore changes if they don't merit inspection (grey and None)
        if (((prev_alert_level is None) and 
                (alert_level is None)) or
                ((prev_alert_level == 'gray') and
                (alert_level == 'gray'))):
            new_inspection = False

        # if overall inspection level changes, send notification
        elif prev_alert_level != alert_level:
            new_inspection = True

        # trigger new inspection if the content of the facility_shaking
        # list changes
        elif len(previous_map.facility_shaking) != len(shakemap.facility_shaking):
            new_inspection = True
        else:
            for idx in range(len(shakemap.facility_shaking)):
                if (shakemap.facility_shaking[idx].facility.facility_id !=
                        previous_map.facility_shaking[idx].facility.facility_id):
                    new_inspection = True
                    break

    return group.has_alert_level(alert_level, scenario), new_inspection, update
