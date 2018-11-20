from jinja2 import Template
import json
import os
import smtplib

from util import sc_dir, SC

class NotificationBuilder(object):
    """
    Uses Jinja to build notifications
    """
    def __init__(self):
        pass
    
    @staticmethod
    def build_new_event_html(events=None, notification=None, group=None, name=None, web=False, config=None):
        temp_manager = TemplateManager()
        if not config:
            if name is None and notification is not None:
                config = temp_manager.get_configs('new_event', 
                                                    name=notification.group.template)
            else:
                config = temp_manager.get_configs('new_event', 
                                                    name=name)
        
        if name is None and notification is not None:
            template = temp_manager.get_template('new_event',
                                                name=notification.group.template)
        else:
            template = temp_manager.get_template('new_event',
                                                name=name)
        

        return template.render(events=events,
                               group=group,
                               notification=notification,
                               sc=SC(),
                               config=config,
                               web=web)
    
    @staticmethod
    def build_insp_html(shakemap, name=None, web=False, config=None):
        temp_manager = TemplateManager()
        if not config:
            config = temp_manager.get_configs('inspection', name=name)
        
        template = temp_manager.get_template('inspection', name=name)

        facility_shaking = shakemap.facility_shaking
        if len(facility_shaking) > 0:
            facility_shaking.sort(key=lambda x: x.weight,
                                        reverse=True)

        fac_details = {'all': 0, 'gray': 0, 'green': 0,
                       'yellow': 0, 'orange': 0, 'red': 0}
        
        for fs in facility_shaking:
            fac_details['all'] += 1
            fac_details[fs.alert_level] += 1

        return template.render(shakemap=shakemap,
                               facility_shaking=facility_shaking,
                               fac_details=fac_details,
                               sc=SC(),
                               config=config,
                               web=web)

    @staticmethod
    def build_pdf_html(shakemap, name=None, web=False, config=None):
        temp_manager = TemplateManager()
        if not config:
            config = temp_manager.get_configs('pdf', name=name)

        template = temp_manager.get_template('pdf', name=name)

        facility_shaking = shakemap.facility_shaking
        if len(facility_shaking) > 0:
            facility_shaking.sort(key=lambda x: x.weight,
                                        reverse=True)

        fac_details = {'all': 0, 'gray': 0, 'green': 0,
                       'yellow': 0, 'orange': 0, 'red': 0}

        for fs in facility_shaking:
            fac_details['all'] += 1
            fac_details[fs.alert_level] += 1

        colors = {
            'red': 'FF0000',
            'orange': 'FFA500',
            'yellow': 'FFFF00',
            'green': '50C878',
            'gray': 'AAAAAA'
        }

        return template.render(shakemap=shakemap,
                               facility_shaking=facility_shaking,
                               fac_details=fac_details,
                               sc=SC(),
                               config=config,
                               web=web,
                               colors=colors)

    @staticmethod
    def build_update_html(update_info=None):
        '''
        Builds an update notification using a jinja2 template
        '''
        template_manager = TemplateManager()
        template = template_manager.get_template('system', name='update')

        return template.render(update_info=update_info)

class Mailer(object):
    """
    Keeps track of information used to send emails
    
    If a proxy is setup, Mailer will try to wrap the smtplib module
    to access the smtp through the proxy
    """
    
    def __init__(self):
        # get info from the config
        sc = SC()
        
        self.me = sc.dict['SMTP']['from'] or sc.dict['SMTP']['username']
        self.username = sc.smtp_username
        self.password = sc.smtp_password
        self.server_name = sc.smtp_server
        self.server_port = int(sc.smtp_port)
        self.security = sc.dict['SMTP']['security']
        self.log = ''
        
    def send(self, msg=None, you=None, debug=False):
        """
        Send an email (msg) to specified addresses (you) using SMTP
        server details associated with the object
        """
        server = smtplib.SMTP(self.server_name, self.server_port) #port 587 or 25

        if self.security.lower() == 'tls':
            server.ehlo()
            server.starttls()
            server.ehlo()

        if self.username and self.password:
            server.login(self.username, self.password)
        
        server.sendmail(self.me, you, msg.as_string())
        server.quit()

class TemplateManager(object):
    """
    Manages templates and configs for emails
    """

    @staticmethod
    def get_configs(not_type, name=None):
        if name is None:
            temp_name = 'default.json'
        else:
            temp_name = name + '.json'
            conf_file = os.path.join(sc_dir(),
                                    'templates',
                                    not_type,
                                    temp_name)

        try:
            # try to find the template
            conf_str = open(conf_file, 'r')
        except Exception:
            # just get the default template if the supplied one doesn't
            # exist
            conf_file = os.path.join(sc_dir(),
                                    'templates',
                                    not_type,
                                    'default.json')
            conf_str = open(conf_file, 'r')

        config = json.loads(conf_str.read())
        conf_str.close()
        return config

    @staticmethod
    def save_configs(not_type, name, config):
        if isinstance(config, dict):
            conf_file = os.path.join(sc_dir(),
                                    'templates',
                                    not_type,
                                    name + '.json')
            conf_str = open(conf_file, 'w')
            conf_str.write(json.dumps(config, indent=4))
            conf_str.close()
            return config
        else:
            return None

    @staticmethod
    def get_template(not_type, name=None):
        if name is None:
            temp_name = 'default.html'
        else:
            temp_name = name + '.html'
            temp_file = os.path.join(sc_dir(),
                                        'templates',
                                        not_type,
                                        temp_name)

        try:
            temp_str = open(temp_file, 'r')
        except Exception:
            temp_file = os.path.join(sc_dir(),
                                        'templates',
                                        not_type,
                                        'default.html')
            temp_str = open(temp_file, 'r')
        
        template = Template(temp_str.read())
        temp_str.close()
        return template

    @staticmethod
    def get_template_string(not_type, name=None):
        temp_name = 'default.html'
        if name is not None:
            temp_name = name + '.html'

        temp_file = os.path.join(sc_dir(),
                                    'templates',
                                    not_type,
                                    temp_name)
        try:
            temp = open(temp_file, 'r')
            temp_str = temp.read()
            temp.close()
            return temp_str
        except Exception:
            return None

    @staticmethod
    def save_template(not_type, name, template_str):
        temp_file = os.path.join(sc_dir(),
                                'templates',
                                not_type,
                                name + '.html')
        temp_file = open(temp_file, 'w')
        temp_file.write(template_str)
        temp_file.close()
        return temp_file

    @staticmethod
    def get_template_names():
        '''
        Get a list of the existing template names
        '''
        temp_folder = os.path.join(sc_dir(),
                                   'templates',
                                   'new_event')
        file_list = os.listdir(temp_folder)

        # get the names of the templates
        just_names = [f.split('.')[0] for f in file_list if f[-5:] == '.json']
        return just_names
    
    def create_new(self, name):
        event_configs = self.get_configs('new_event', 'default')
        event_temp = self.get_template_string('new_event', 'default')

        insp_configs = self.get_configs('inspection', 'default')
        insp_temp = self.get_template_string('inspection', 'default')

        # save configs
        event_configs_saved = self.save_configs('new_event', name, event_configs)
        insp_configs_saved = self.save_configs('inspection', name, insp_configs)
        
        # save templates
        event_template_saved = self.save_template('new_event', name, event_temp)
        insp_template_saved = self.save_template('inspection', name, insp_temp)

        return bool(None not in [event_configs_saved,
                                    insp_configs_saved,
                                    event_template_saved,
                                    insp_template_saved])
