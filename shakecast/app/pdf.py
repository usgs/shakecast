from fpdf import FPDF, HTMLMixin
import os

from .notifications import NotificationBuilder
from .orm import ShakeMap, Session

class Pdf(FPDF, HTMLMixin):
    def footer(self):
        # Position at 1.5 cm from bottom
        self.set_y(-15)
        # Arial italic 8
        self.set_font('Arial', 'I', 8)
        # Page number
        self.cell(0, 10, 'Page ' + str(self.page_no()) + '/{nb}', 0, 0, 'C')

def generate_impact_pdf(shakemap, save=False, pdf_name='', template_name=''):
    pdf = Pdf()
    pdf.add_page()

    nb = NotificationBuilder()
    html = nb.build_pdf_html(shakemap, 'header', template_name=template_name)
    pdf.write_html(html)

    html = nb.build_pdf_html(shakemap, 'summary', template_name=template_name)
    pdf.write_html(html)

    shakemap_image_loc = os.path.join(shakemap.directory_name, 'intensity.jpg')
    pdf.image(shakemap_image_loc, h=160, x=40)

    pdf.add_page()
    nb = NotificationBuilder()
    html = nb.build_pdf_html(shakemap, 'facility-table', template_name=template_name)
    pdf.write_html(html)

    pdf.alias_nb_pages()
    pdf_string = pdf.output('', 'S')

    if save is True:
        pdf_name = pdf_name or 'impact.pdf'
        save_pdf(pdf_string, pdf_name, shakemap.local_products_dir)
    return pdf_string


def save_pdf(pdf_string, file_name, directory):
    file_name_ = os.path.join(directory, file_name)
    with open(file_name_, 'wb') as file_:
        file_.write(pdf_string)
