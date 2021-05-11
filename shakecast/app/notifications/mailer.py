import importlib
import smtplib

import shakecast.app.env as env

class Mailer(object):
    """
    Keeps track of information used to send emails
    
    If a proxy is setup, Mailer will try to wrap the smtplib module
    to access the smtp through the proxy
    """
    
    def __init__(self):
        importlib.reload(env)

        self.me = env.SMTP_FROM or env.SMTP_USERNAME
        self.username = env.SMTP_USERNAME
        self.password = env.SMTP_PASSWORD
        self.server_name = env.SMTP_SERVER
        self.server_port = env.SMTP_PORT
        self.security = env.SMTP_SECURITY
        self.notify = bool(env.SMTP_SEND_NOTIFICATIONS)
        
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
