import smtpd
import asyncore

class TestSmtpServer(smtpd.SMTPServer):
    @staticmethod
    def process_message(*args, **kwargs):
        pass

def main():
    server = TestSmtpServer(('localhost', 1025), None)
    asyncore.loop()

if __name__ == '__main__':
    main()
