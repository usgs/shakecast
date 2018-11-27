import smtpd
import asyncore
from sc.app.util import SC

class TestSmtpServer(smtpd.SMTPServer):
    @staticmethod
    def process_message(*args, **kwargs):
        pass

def main():
    sc = SC()
    port = sc.dict['SMTP']['port']
    server = TestSmtpServer(('localhost', port), None)
    asyncore.loop()

if __name__ == '__main__':
    main()
