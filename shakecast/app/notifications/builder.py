from .templates import TemplateManager
from ..util import SC

class NotificationBuilder(object):
    """
    Uses Jinja to build notifications
    """
    def __init__(self):
        pass
    
    @staticmethod
    def build_new_event_html(events=None, notification=None, group=None, name=None, web=False, config=None):
        temp_manager = TemplateManager()
        template_name = (name or 'default').lower()

        if not config:
            config = temp_manager.get_configs('new_event', 
                                                name=template_name)
        
        template = temp_manager.get_template('new_event',
                                            name=template_name)
        
        events.sort(key=lambda x: x.magnitude, reverse=True)
        return template.render(events=events,
                               group=group,
                               notification=notification,
                               sc=SC(),
                               config=config,
                               web=web)
    
    @staticmethod
    def build_insp_html(shakemap, notification=None, name=None, web=False, config=None):
        temp_manager = TemplateManager()
        template_name = (name or 'default').lower()
        if not config:
            config = temp_manager.get_configs('inspection', name=template_name)
        
        template = temp_manager.get_template('inspection', name=template_name)

        if config.get('table'):
          shakemap.sort_facility_shaking(config['table'].get('sort', 'weight'))
        else:
          shakemap.sort_facility_shaking('weight')

        if notification:
            group = notification.group
            scenario = True if shakemap.type == 'scenario' else False
            alert_levels = group.get_alert_levels(scenario)
            facility_shaking = filter(
                lambda x: group in x.facility.groups and x.alert_level in alert_levels,
                shakemap.facility_shaking
            )
            fac_details = shakemap.get_impact_summary(group)
        else:
            facility_shaking = shakemap.facility_shaking
            fac_details = shakemap.get_impact_summary()
    

        return template.render(shakemap=shakemap,
                               facility_shaking=facility_shaking,
                               fac_details=fac_details,
                               notification=notification,
                               sc=SC(),
                               config=config,
                               template_name=template_name,
                               web=web)

    @staticmethod
    def build_update_html(update_info=None):
        '''
        Builds an update notification using a jinja2 template
        '''
        template_manager = TemplateManager()
        template = template_manager.get_template('system', name='update')

        return template.render(update_info=update_info)
