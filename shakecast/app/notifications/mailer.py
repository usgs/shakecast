import smtplib

from ..util import SC

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
        self.server_port = int(sc.dict['SMTP']['port'])
        self.security = sc.dict['SMTP']['security']
        self.log = ''
        self.notify = sc.dict['Notification']['notify']
        
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

        if self.notify is True:
            server.sendmail(self.me, you, msg.as_string())
        server.quit()
