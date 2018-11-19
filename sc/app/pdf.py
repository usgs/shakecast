from fpdf import FPDF, HTMLMixin
import os

from objects import NotificationBuilder
from orm import ShakeMap, Session

class Pdf(FPDF, HTMLMixin):
    def header(self):
        # Arial bold 15
        self.set_font('Arial', 'B', 15)
        # Move to the right
        self.cell(80)
        # Title
        self.cell(30, 10, 'ShakeCast Report')
        # Line break
        self.ln(20)
    
    def footer(self):
        # Position at 1.5 cm from bottom
        self.set_y(-15)
        # Arial italic 8
        self.set_font('Arial', 'I', 8)
        # Page number
        self.cell(0, 10, 'Page ' + str(self.page_no()) + '/{nb}', 0, 0, 'C')

def generate_impact_pdf(shakemap, save=False):
    pdf = Pdf()
    pdf.add_page()

    nb = NotificationBuilder()
    html = nb.build_pdf_html(shakemap, 'summary')
    pdf.write_html(html)

    shakemap_image_loc = os.path.join(shakemap.directory_name, 'intensity.jpg')
    pdf.image(shakemap_image_loc, h=160, x=40)

    pdf.add_page()
    nb = NotificationBuilder()
    html = nb.build_pdf_html(shakemap, 'facility-table')
    pdf.write_html(html)

    pdf.alias_nb_pages()
    pdf_string = pdf.output('', 'S')

    if save is True:
        save_pdf(pdf_string, 'impact.pdf', shakemap.directory_name)
    return pdf_string

def save_pdf(pdf_string, file_name, directory):
    file_name_ = os.path.join(directory, file_name)
    with open(file_name_, 'wb') as file_:
        file_.write(pdf_string)



if __name__ == '__main__':
    session = Session()
    sms = session.query(ShakeMap).all()
    sms_w_facs = [sm for sm in sms if len(sm.facility_shaking) > 0]

    sm = sms_w_facs[-1]
    print sm.shakemap_id, sm.shakemap_version
    pdf = generate_impact_pdf(sm, save=True)
    

