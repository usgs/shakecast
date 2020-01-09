from jinja2 import Environment, Template
import os

from ...util import SC

jinja_env = Environment(extensions=['jinja2.ext.do'])

def generate_geojson_html(shakemap, group=None, save=False, name='geojson_capture'):
    # determine if geojson exists
    geojson_product = shakemap.get_local_product('geojson')
    geojson_string = geojson_product.read()

    # use template.html to build standalone html page
    __location__ = os.path.realpath(
            os.path.join(os.getcwd(), os.path.dirname(__file__)))
    
    template_name = os.path.join(__location__, 'template.html')
    with open(template_name, 'r') as file_:
        template = jinja_env.from_string(file_.read().decode('utf-8'))

    html = template.render(impact_geojson=geojson_string,
            shakemap=shakemap,
            sc=SC())
    
    if save == True:
        if '.html' not in name:
            name += '.html'

        file_name = os.path.join(shakemap.local_products_dir, name)
        with open(file_name, 'w') as file_:
            file_.write(html.encode('utf-8'))
    
    return html

def main(group, shakemap, name):
    return generate_geojson_html(shakemap, group=group, save=True)
