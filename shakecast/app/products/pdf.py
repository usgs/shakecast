from fpdf import FPDF, HTMLMixin
import os
import time

from ..impact import get_event_impact
from ..notifications.builder import NotificationBuilder
from ..notifications.templates import TemplateManager
from ..urlopener import URLOpener
from ..util import Clock, SC


class Pdf(FPDF):
    def __init__(self):
        super(Pdf, self).__init__()

        self.set_font('Arial', '', 10)

    def footer(self):
        # Position at 1.5 cm from bottom
        self.set_y(-15)
        # Arial italic 8
        self.set_font('Arial', 'I', 8)
        # Page number
        self.cell(0, 10, 'Page ' + str(self.page_no()) + '/{nb}', 0, 0, 'C')


def generate_impact_pdf(group, shakemap, save=False, pdf_name='', template_name=''):
    pdf = Pdf()
    pdf.add_page()

    tm = TemplateManager()
    configs = tm.get_configs('pdf', template_name or 'default.json')
    add_header_to_pdf(pdf, shakemap, configs['header'])

    pdf.ln(pdf.font_size * 2)
    add_summary_to_pdf(pdf, shakemap)

    try:
        add_impact_image_to_pdf(pdf, shakemap)
    except Exception:
        # can't add impact pdf
        pass

    pdf.add_page()
    add_shakemap_details_to_pdf(pdf, shakemap)

    add_shakemap_to_pdf(pdf, shakemap)

    facility_shaking = sorted(
        shakemap.facility_shaking, key=lambda x: x.weight, reverse=True)
    facility_shaking = filter(lambda x: group in x.facility.groups, facility_shaking)
    add_pdf_table(pdf, configs['table']['table_head'],
                  facility_shaking)

    pdf.alias_nb_pages()
    pdf_string = pdf.output('', 'S')

    if save is True:
        pdf_name = pdf_name or 'impact.pdf'
        save_pdf(pdf_string, pdf_name, shakemap.local_products_dir)
    return pdf_string


def add_header_to_pdf(pdf, shakemap, configs):
    font = pdf.font_family
    style = pdf.font_style
    size = pdf.font_size_pt

    title = configs.get('title', 'ShakeCast Report')

    pdf.set_font(font, 'b', 36)
    pdf.multi_cell(pdf.w, pdf.font_size + 5, title)

    pdf.set_font(font, 'b', 14)
    pdf.multi_cell(pdf.w, pdf.font_size, shakemap.event.title)

    pdf.set_font(font, style, size)

def add_impact_image_to_pdf(pdf, shakemap):
    width = pdf.w * .75
    top = pdf.get_y() + 10
    left = (pdf.w - width) / 2

    url_opener = URLOpener()
    sc = SC()

    impact_image = os.path.join(shakemap.local_products_dir, 'geojson_capture.html')
    image = url_opener.open(sc.dict.get('image_server', '').format(impact_image, 'map_pane'))
    image_location = shakemap.save_local_product('impact.png', image, write_method='wb')

    pdf.image(image_location, x=left, y=top, w=width)


def add_shakemap_details_to_pdf(pdf, shakemap):
    font = pdf.font_family
    style = pdf.font_style
    size = pdf.font_size_pt

    details_height = pdf.font_size + 2
    pdf.set_font(font, 'b', 14)
    pdf.multi_cell(pdf.w, pdf.font_size, 'Event Details')

    pdf.set_font(font, '', 12)
    pdf.multi_cell(pdf.w, details_height, 'Epicenter Location: {}, {}'.format(
        shakemap.event.lat, shakemap.event.lon))
    pdf.multi_cell(pdf.w, details_height,
                   'Event ID: {}'.format(shakemap.shakemap_id))
    pdf.multi_cell(pdf.w, details_height,
                   'Version: {}'.format(shakemap.shakemap_version))

    clock = Clock()
    event_time = clock.from_time(shakemap.event.time)
    event_time_str = event_time.strftime('%H:%M %d-%b-%Y')
    pdf.multi_cell(pdf.w, details_height,
                   'Event Time: {}'.format(event_time_str))

    datetime = clock.from_time(time.time())
    date_string = datetime.strftime('%H:%M %d-%b-%Y')
    pdf.multi_cell(pdf.w, details_height,
                   'Report Generated: {}'.format(date_string))
    pdf.set_font(font, style, size)


def add_summary_to_pdf(pdf, shakemap):
    font = pdf.font_family
    style = pdf.font_style
    size = pdf.font_size_pt

    impact = get_event_impact(shakemap.facility_shaking)

    details_height = pdf.font_size + 2
    font = pdf.font_family
    pdf.set_font(font, 'b', 14)
    pdf.multi_cell(pdf.w, details_height, 'Impact Summary')
    pdf.set_font(font, '', 12)
    pdf.multi_cell(pdf.w, details_height,
                   'Total Facilities Evaluated: {}'.format(impact['all']))
    pdf.multi_cell(pdf.w, details_height, 'High: {}'.format(impact['red']))
    pdf.multi_cell(pdf.w, details_height,
                   'Medium-High: {}'.format(impact['orange']))
    pdf.multi_cell(pdf.w, details_height,
                   'Medium: {}'.format(impact['yellow']))
    pdf.multi_cell(pdf.w, details_height, 'Low: {}'.format(impact['green']))
    pdf.multi_cell(pdf.w, details_height, 'None: {}'.format(impact['gray']))

    pdf.set_font(font, style, size)


def add_pdf_table(pdf, headers, data):
    use_headers = [header for header in headers if header['use']]

    page_width = pdf.w - 2 * pdf.l_margin

    table_width_percent = get_line_width_percent(use_headers)
    if table_width_percent < 1:
        x_offset = (page_width * (1-table_width_percent)) / 2 + pdf.l_margin
    else:
        x_offset = 5

    pdf.set_fill_color(255, 255, 255)
    padding = 2.0

    add_pdf_table_page(use_headers, pdf, padding, x_offset)
    facility_values = get_impact_line_values(use_headers, data)

    line_count = 0
    for line in facility_values:
        # add a new page if we have to
        max_cell_height = get_line_height(line)
        if pdf.get_y() + max_cell_height > pdf.h - pdf.t_margin - pdf.b_margin:
            add_pdf_table_page(use_headers, pdf, padding, x_offset)
    
        pdf.set_x(x_offset)
        add_line_to_pdf(line, use_headers, pdf, padding=padding)

        pdf.ln(max_cell_height + padding)

        line_count += 1

        if line_count % 2 != 0:
            pdf.set_fill_color(215, 215, 215)
        else:
            pdf.set_fill_color(255, 255, 255)


def add_shakemap_to_pdf(pdf, shakemap):
    shakemap_image_loc = os.path.join(shakemap.directory_name, 'intensity.jpg')

    width = pdf.w * .75
    top = pdf.get_y() + 10
    left = (pdf.w - width) / 2

    pdf.image(shakemap_image_loc, x=left, y=top, w=width)


def add_line_to_pdf(line, headers, pdf, padding=0):
    page_width = pdf.w - 2 * pdf.l_margin
    max_cell_height = get_line_height(line)
    start_y = pdf.get_y()

    header_pos = 0
    for cell in line:
        start_x = pdf.get_x()

        cell_width = page_width * float(cell['width'])
        cell_height = get_cell_height(cell)

        cell.update(headers[header_pos])
        if cell.get('colors', False):
            colors = cell['colors']
            rgb = colors.get(cell['value'], {'r': 0, 'g': 0, 'b': 0})
            pdf.set_text_color(rgb['r'], rgb['g'], rgb['b'])

        font_style = pdf.font_style
        if cell.get('font_style', False):
            pdf.set_font(pdf.font_family, cell['font_style'], pdf.font_size_pt)

        if cell.get('translate', False):
            value = cell['translate'][cell['value']]
        else:
            value = cell['value']

        if cell_height > pdf.font_size:
            lines = cell_height / pdf.font_size
            pdf.multi_cell(cell_width, pdf.font_size +
                           (padding / lines), str(value), border=1, fill=1)
        else:
            pdf.multi_cell(cell_width, max_cell_height +
                           padding, str(value), border=1, fill=1)

        pdf.set_text_color(0, 0, 0)
        pdf.set_font(pdf.font_family, font_style, pdf.font_size_pt)
        pdf.set_xy(start_x + cell_width, start_y)

        header_pos += 1


def add_pdf_table_page(headers, pdf, padding=0, x_offset=0):
    pdf.add_page()
    page_width = pdf.w - 2 * pdf.l_margin

    font = pdf.font_family
    style = pdf.font_style
    size = pdf.font_size_pt

    pdf.set_font(font, 'b', size)

    if x_offset:
        pdf.set_x(x_offset)
    for header in headers:
        cell_width = page_width * float(header['width'])
        pdf.cell(cell_width, pdf.font_size + padding, header['val'], border=1)

    pdf.ln(pdf.font_size + padding)
    pdf.set_font(font, style, size)


def get_impact_line_values(headers, data):
    values = []
    for facility_shaking in data:
        facility_data = []
        for header in headers:
            header_name = header['name']

            if header_name == 'shaking_value':
                header_name = facility_shaking.facility.metric.lower()

            value = facility_shaking.__dict__.get(
                header_name, facility_shaking.facility.__dict__.get(header_name,
                                                                    facility_shaking.facility.get_attribute(header_name) or ''))
            if type(value) is float:
                value = round(value * 100) / 100

            facility_data += [{'value': value,
                               'width': float(header['width'])}]

        values += [facility_data]

    return values


def get_line_height(line):
    max_height = 0
    for cell in line:
        height = get_cell_height(cell)
        max_height = height if height > max_height else max_height
    return max_height


def get_line_width_percent(line):
    percent = 0
    for cell in line:
        percent += float(cell['width'])

    return percent


def get_cell_height(cell):
    pdf = Pdf()
    pdf.add_page()
    page_width = pdf.w - 2 * pdf.l_margin

    cell_height = pdf.font_size

    start_y = pdf.get_y()
    cell_width = page_width * float(cell['width'])
    pdf.multi_cell(cell_width, cell_height, str(cell['value']), border=1)

    return pdf.get_y() - start_y


def save_pdf(pdf_string, file_name, directory):
    file_name_ = os.path.join(directory, file_name)
    with open(file_name_, 'wb') as file_:
        file_.write(pdf_string)

def main(group, shakemap, name):
    return generate_impact_pdf(group, shakemap, save=True, pdf_name=name, template_name=group.template)
