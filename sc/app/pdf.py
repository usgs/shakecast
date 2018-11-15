from fpdf import FPDF, HTMLMixin
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

def generate_impact_pdf(shakemap):
    pdf = Pdf()
    pdf.add_page()

    nb = NotificationBuilder()
    html = nb.build_pdf_html(shakemap)

    import pdb
    pdb.set_trace()
    pdf.write_html(html)

    pdf.alias_nb_pages()
    pdf.output('tuto1.pdf', 'F')

def generate_impact_table_html(facilities):
    html = '''
        <table border="1" cellpadding="5px">
            <thead>
                <tr>
                    <th width="100%">Name</th>
                </tr>
            </thead>
            <tbody>
                {}
            </tbody>
        </table>
    '''

    facility_template = '''
        <tr>
            <td>{}</td>
        </tr>
    '''

    facility_rows = [
        facility_template.format(facility['name']) 
        for facility in facilities
    ]

    facility_string = ''.join(facility_rows)

    return html.format(facility_string)

if __name__ == '__main__':
    session = Session()
    sms = session.query(ShakeMap).all()
    sms_w_facs = [sm for sm in sms if len(sm.facility_shaking) > 0]

    generate_impact_pdf(sms_w_facs[-1])
    
