import asyncore
import smtpd

from shakecast.app.util import SC

class TestSmtpServer(smtpd.SMTPServer):
    @staticmethod
    def process_message(*args, **kwargs):
        pass

def main():
    sc = SC()
    port = sc.dict['SMTP']['port']
    server = TestSmtpServer(('', port), None)
    asyncore.loop()

if __name__ == '__main__':
    main()
