import asyncore
import smtpd

from shakecast.app.util import SC
from shakecast.app.env import SMTP_PORT

class TestSmtpServer(smtpd.SMTPServer):
    @staticmethod
    def process_message(*args, **kwargs):
        pass

def main():
    sc = SC()
    port = int(SMTP_PORT)
    print(f'Starting mock SMTP server on port {SMTP_PORT}')

    server = TestSmtpServer(('127.0.0.0', port), None)
    asyncore.loop()

if __name__ == '__main__':
    main()
