import time

from .notifications import inspection_notification_service

while 1:
    try:
        inspection_notification_service()
    except Exception as e:
        print(f'Notification sending error: {str(e)}')
    
    time.sleep(5)
    