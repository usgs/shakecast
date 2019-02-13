from email.mime.text import MIMEText
from email.mime.image import MIMEImage
from email.mime.multipart import MIMEMultipart
import json
import os

from notifications import Mailer, NotificationBuilder, TemplateManager
from urlopener import URLOpener
from orm import dbconnect, User
from util import merge_dicts, root_dir, SC, sc_dir

class SoftwareUpdater(object):
    '''
    Check against USGS web to determine if pyCast needs to update.
    Notifies admin when updates are required and handles the update
    process.
    '''
    def __init__(self):
        sc = SC()
        self.json_url = sc.dict['Server']['update']['json_url']
        self.current_version = sc.dict['Server']['update']['software_version']
        self.current_update = sc.dict['Server']['update']['update_version']
        self.admin_notified = sc.dict['Server']['update']['admin_notified']
        self.sc_root_dir = root_dir()

    def get_update_info(self):
        """
        Pulls json feed from USGS web with update information
        """
        url_opener = URLOpener()
        json_str = url_opener.open(self.json_url)
        update = json.loads(json_str)

        return update

    def check_update(self, testing=False):
        '''
        Check the list of updates to see if any of them require 
        attention
        '''
        sc = SC()
        self.current_version = sc.dict['Server']['update']['software_version']

        update = self.get_update_info()
        update_required = False
        notify = False
        update_info = set()

        if self.check_new_update(update['version'], self.current_version) is True:
            update_required = True
            update_info.add(update['info'])

            if self.check_new_update(update['version'], self.current_update) is True:
                # update current update version in sc.conf json
                sc = SC()
                sc.dict['Server']['update']['update_version'] = update['version']

                if testing is not True:
                    sc.save_dict()
                notify = True
    
        return update_required, notify, update_info


    @staticmethod
    def check_new_update(new, existing):
        if (('b' in existing and 'b' not in new) or   
                ('b' in existing and 'rc' in new) or
                ('rc' in existing and ('rc' not in new 
                                        and 'b' not in new))):
            return True
        elif (('rc' in existing and 'b' in new) or
                    ('b' not in existing and 'b' in new) or
                    ('rc' not in existing and 'rc' in new)):
            return False

        new_split = new.split('.')
        if 'b' in new_split[-1]:
            new_split = new_split[:-1] + new_split[-1].split('b')
        elif 'rc' in new_split[-1]:
            new_split = new_split[:-1] + new_split[-1].split('rc')

        existing_split = existing.split('.')
        if 'b' in existing_split[-1]:
            existing_split = existing_split[:-1] + existing_split[-1].split('b')
        elif 'rc' in existing_split[-1]:
            existing_split = existing_split[:-1] + existing_split[-1].split('rc')

        if len(existing_split) > len(new_split):
            range_ = len(new_split)
        else:
            range_ = len(existing_split)

        for idx in range(range_):
            if int(new_split[idx]) > int(existing_split[idx]):
                return True        
        return False


    def notify_admin(self, update_info=None, testing=False):
        # notify admin
        admin_notified = False
        admin_notified = self.send_update_notification(update_info=update_info)

        if admin_notified is True:
            # record admin Notification
            sc = SC()
            sc.dict['Server']['update']['admin_notified'] = True
            if testing is not True:
                sc.save_dict()

    def update(self, testing=False):
        update = self.get_update_info()
        version = self.current_version
        sc = SC()
        delim = os.sep
        failed = []
        success = []
        # concatinate files if user is multiple updates behind
        files = update.get('files', [])
        for file_ in files:
            try:
                # download file
                url_opener = URLOpener()
                text_file = url_opener.open(file_['url'])

                # get the full path to the file
                file_path = delim.join([root_dir()] +
                                    file_['path'].split('/'))
                norm_file_path = os.path.normpath(file_path)

                # open the file
                if 'sc.json' not in file_['path']:
                    # normal text file
                    file_to_update = open(norm_file_path, 'w')
                    file_to_update.write(text_file)
                    file_to_update.close()
                else:
                    # json configs require special update
                    self.update_configs(text_file)

                if self.check_new_update(file_['version'], version):
                    version = file_['version']
                success += [file_]
            except Exception:
                failed += [file_]
        
        sc.dict['Server']['update']['software_version'] = version
        if testing is not True:
            sc.save_dict()

        return success, failed

    @staticmethod
    def update_configs(new):
        """
        Add new configurations, but keep users' changes intact. This will
        have the wrong version number, which will have to be overwritten
        later
        """
        sc = SC()
        new_dict = json.loads(new)

        # map old configs on top of new to retain user settings
        merge_dicts(new_dict, sc.dict)
        sc.dict = new_dict
        sc.save_dict()

    def condense_files(self, update_list):
        files = {}
        for update in update_list:
            for file_ in update['files']:
                file_['version'] = update['version']
                if files.get(file_['path'], False) is False:
                    files[file_['path']] = file_
                else:
                    # check if this update is newer
                    if self.check_new_update(file_['version'],
                                                files[file_['path']]['version']):
                        files[file_['path']] = file_
        
        # convert back to list
        file_list = []
        for key in files.keys():
            file_list.append(files[key])

        return file_list

    @staticmethod
    @dbconnect
    def send_update_notification(update_info=None, session=None):
        '''
        Create notification to alert admin of software updates
        '''
        try:
            not_builder = NotificationBuilder()
            html = not_builder.build_update_html(update_info=update_info)

            #initiate message
            msg = MIMEMultipart()
            msg_html = MIMEText(html, 'html')
            msg.attach(msg_html)

            # find the ShakeCast logo
            logo_str = os.path.join(sc_dir(),'view','static','sc_logo.png')
            
            # open logo and attach it to the message
            logo_file = open(logo_str, 'rb')
            msg_image = MIMEImage(logo_file.read())
            logo_file.close()
            msg_image.add_header('Content-ID', '<sc_logo>')
            msg_image.add_header('Content-Disposition', 'inline')
            msg.attach(msg_image)
            
            mailer = Mailer()
            me = mailer.me

            # get admin emails
            admin = session.query(User).filter(User.user_type.like('admin')).filter(User.email != '').all()
            emails = [a.email for a in admin]

            msg['Subject'] = 'ShakeCast Software Update'
            msg['To'] = ', '.join(emails)
            msg['From'] = me
            
            if len(emails) > 0:
                mailer.send(msg=msg, you=emails)
        
        except:
            return False

        return True

def check_for_updates():
    '''
    Hits the USGS github for ShakeCast to determine if there are
    updates. If there are new updates, the software updater will
    email admin users to alert them
    '''
    status = ''
    error = ''
    update_required = None
    try:
        s = SoftwareUpdater()
        update_required, notify, update_info = s.check_update()

        if notify is True:
            s.notify_admin(update_info=update_info)
        status = 'finished'
    except Exception as e:
        error = str(e)
        status = 'failed'

    return {'status': status, 'message': update_required, 'error': error}
