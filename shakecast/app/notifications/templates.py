import json
import os

from jinja2 import Template, Environment

from ..util import get_conf_dir, get_template_dir

jinja_env = Environment(extensions=['jinja2.ext.do'])

class TemplateManager(object):
    """
    Manages templates and configs for emails
    """

    @staticmethod
    def get_configs(not_type, name=None, sub_dir=None):
        name = name or 'default.json'
        # force json file type
        if '.json' not in name:
            name += '.json'

        # default fallback configs
        fallback = os.path.join('default', name) if sub_dir else 'default.json'

        # pdfs use a subdirectory
        name = os.path.join(sub_dir, name) if sub_dir else name


        json_file_name_template = os.path.join(get_template_dir(),
                                not_type,
                                '{}')

        custom_name = json_file_name_template.format(name)
        default_name = json_file_name_template.format(fallback)
        conf_file_name = custom_name if os.path.isfile(custom_name) else default_name

        with open(conf_file_name, 'r') as conf_file:
            config = json.loads(conf_file.read())

        return config

    @staticmethod
    def save_configs(not_type, name, config):
        if isinstance(config, dict):
            conf_file = os.path.join(get_template_dir(),
                                    not_type,
                                    name + '.json')
            conf_str = open(conf_file, 'w')
            conf_str.write(json.dumps(config, indent=4))
            conf_str.close()
            return config
        else:
            return None

    @staticmethod
    def get_template(not_type, name=None, sub_dir=None):
        name = name or 'default.html'
        # force html file type
        if '.html' not in name:
            name += '.html'

        # default fallback template
        fallback = os.path.join('default', name) if sub_dir else 'default.html'

        # pdfs use a subdirectory
        name = os.path.join(sub_dir, name) if sub_dir else name


        html_file_name_template = os.path.join(get_template_dir(),
                                not_type,
                                '{}')

        custom_name = html_file_name_template.format(name)
        default_name = html_file_name_template.format(fallback)
        html_file_name = custom_name if os.path.isfile(custom_name) else default_name
        
        with open(html_file_name, 'r') as html_file:
            template = jinja_env.from_string(html_file.read())

        return template

    @staticmethod
    def get_template_string(not_type, name=None):
        temp_name = 'default.html'
        if name is not None:
            temp_name = name + '.html'

        temp_file = os.path.join(get_template_dir(),
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
        temp_file = os.path.join(get_template_dir(),
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
        temp_folder = os.path.join(get_template_dir(),
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
    
        pdf_configs = self.get_configs('pdf', 'default')

        # save configs
        event_configs_saved = self.save_configs('new_event', name, event_configs)
        insp_configs_saved = self.save_configs('inspection', name, insp_configs)
        pdf_configs_saved = self.save_configs('pdf', name, pdf_configs)
        
        # save templates
        event_template_saved = self.save_template('new_event', name, event_temp)
        insp_template_saved = self.save_template('inspection', name, insp_temp)

        return (event_configs_saved and
                insp_configs_saved and
                pdf_configs_saved and
                event_template_saved and
                insp_template_saved)
