import unittest

from sc.app.notifications import *
from sc.app.orm import dbconnect, Facility, FacilityShaking, Group, Notification
from util import create_group

class TestMailer(unittest.TestCase):
    '''
    Test the connection to the SMTP server
    '''
    def test_initMailer(self):
        '''
        Fails when the Mailer is unable to initialize. Failure
        is caused by code errors or proxy access
        '''
        m = Mailer()
    
    def test_sendMail(self):
        '''
        Send an email with Mailer object. Will fail with code errors or
        failure to reach SMTP server
        '''
        m = Mailer()
        
        you = self.email
        msg = MIMEText('This email is a test of your ShakeCast SMTP server')
        msg['Subject'] = 'ShakeCast SMTP TEST'
        msg['From'] = m.me
        msg['To'] = you
        
        m.send(msg=msg, you=you)

class TestGroupGetsNotification(unittest.TestCase):

    @dbconnect
    def test_forFirstNotification(self, session=None):

        sm1 = ShakeMap(
            shakemap_id = 'shakemap1',
            shakemap_version = 1
        )

        session.add(sm1)

        group = create_group(name='GLOBAL')

        session.add(group)

        n1 = Notification(
            shakemap = sm1
        )

        session.add(n1)

        session.commit()

        # check notification 1
        has_alert_level, new_inspection, update = check_notification_for_group(
                                                    group,
                                                    n1,
                                                    session=session
                                                )
        self.assertTrue(has_alert_level)
        self.assertTrue(new_inspection)
        self.assertFalse(update)

        objs = [sm1, group ,n1]
        for obj in objs:
            session.delete(obj)

        session.commit()

    @dbconnect
    def test_updateNotificationNoneNone(self, session=None):

        sm1 = ShakeMap(
            shakemap_id = 'shakemap1',
            shakemap_version = 1
        )

        sm2 = ShakeMap(
            shakemap_id = 'shakemap1',
            shakemap_version = 2
        )

        session.add_all([sm1, sm2])

        group = create_group(name='GLOBAL')

        session.add(group)

        n1 = Notification(
            shakemap = sm1
        )

        n2 = Notification(
            shakemap = sm2
        )

        session.add_all([n1, n2])

        session.commit()

        # check notification 1
        has_alert_level, new_inspection, update = check_notification_for_group(
                                                    group,
                                                    n2,
                                                    session=session
                                                )
        self.assertTrue(has_alert_level)
        self.assertFalse(new_inspection)
        self.assertTrue(update)

        objs = [sm1, sm2, n1, n2, group]
        for obj in objs:
            session.delete(obj)
        
        session.commit()

    @dbconnect
    def test_changedNotificationNoneGrey(self, session=None):

        sm1 = ShakeMap(
            shakemap_id = 'shakemap1',
            shakemap_version = 1
        )

        sm2 = ShakeMap(
            shakemap_id = 'shakemap1',
            shakemap_version = 2
        )

        session.add_all([sm1, sm2])

        group = create_group(name='GLOBAL')

        session.add(group)

        n1 = Notification(
            shakemap = sm1
        )

        n2 = Notification(
            shakemap = sm2
        )

        session.add_all([n1, n2])

        fs = FacilityShaking(
            shakemap = sm2,
            weight = .5
        )

        session.add(fs)

        session.commit()

        # check notification 1
        has_alert_level, new_inspection, update = check_notification_for_group(
                                                    group,
                                                    n2,
                                                    session=session
                                                )
        self.assertTrue(has_alert_level)
        self.assertTrue(new_inspection)
        self.assertTrue(update)

        objs = [sm1, sm2, n1, n2, group]
        for obj in objs:
            session.delete(obj)
        
        session.commit()

    @dbconnect
    def test_changedNotificationGreyGreen(self, session=None):

        sm1 = ShakeMap(
            shakemap_id = 'shakemap1',
            shakemap_version = 1
        )

        sm2 = ShakeMap(
            shakemap_id = 'shakemap1',
            shakemap_version = 2
        )

        session.add_all([sm1, sm2])

        group = create_group(name='GLOBAL')

        session.add(group)

        n1 = Notification(
            shakemap = sm1
        )

        n2 = Notification(
            shakemap = sm2
        )

        session.add_all([n1, n2])

        fs1 = FacilityShaking(
            shakemap = sm1,
            weight = .1
        )

        fs2 = FacilityShaking(
            shakemap = sm2,
            weight = 1
        )

        session.add_all([fs1, fs2])

        session.commit()

        # check notification 1
        has_alert_level, new_inspection, update = check_notification_for_group(
                                                    group,
                                                    n2,
                                                    session=session
                                                )
        self.assertTrue(has_alert_level)
        self.assertTrue(new_inspection)
        self.assertTrue(update)

        objs = [sm1, sm2, n1, n2, group]
        for obj in objs:
            session.delete(obj)
        
        session.commit()

    @dbconnect
    def test_unchangedNotificationGreenGreen(self, session=None):
        sm1 = ShakeMap(
            shakemap_id = 'shakemap1',
            shakemap_version = 1
        )

        sm2 = ShakeMap(
            shakemap_id = 'shakemap1',
            shakemap_version = 2
        )

        session.add_all([sm1, sm2])

        group = create_group(name='GLOBAL')

        session.add(group)

        n1 = Notification(
            shakemap = sm1
        )

        n2 = Notification(
            shakemap = sm2
        )

        session.add_all([n1, n2])

        fac1 = Facility(
            facility_id = 1
        )

        fs1 = FacilityShaking(
            shakemap = sm1,
            weight = 1,
            facility = fac1
        )

        fs2 = FacilityShaking(
            shakemap = sm2,
            weight = 1,
            facility = fac1
        )

        session.add_all([fac1, fs1, fs2])

        session.commit()

        # check notification 1
        has_alert_level, new_inspection, update = check_notification_for_group(
                                                    group,
                                                    n2,
                                                    session=session
                                                )
        self.assertTrue(has_alert_level)
        self.assertFalse(new_inspection)
        self.assertTrue(update)

        objs = [sm1, sm2, n1, n2, group, fac1]
        for obj in objs:
            session.delete(obj)
        
        session.commit()

    @dbconnect
    def test_changedNotificationGreenGreen(self, session=None):
        sm1 = ShakeMap(
            shakemap_id = 'shakemap1',
            shakemap_version = 1
        )

        sm2 = ShakeMap(
            shakemap_id = 'shakemap1',
            shakemap_version = 2
        )

        session.add_all([sm1, sm2])

        group = create_group(name='GLOBAL')

        session.add(group)

        n1 = Notification(
            shakemap = sm1
        )

        n2 = Notification(
            shakemap = sm2
        )

        session.add_all([n1, n2])

        fac1 = Facility(
            facility_id = 1
        )

        fac2 = Facility(
            facility_id = 2
        )

        fs1 = FacilityShaking(
            shakemap = sm1,
            weight = 1,
            facility = fac1
        )

        fs2 = FacilityShaking(
            shakemap = sm2,
            weight = 1,
            facility = fac2
        )

        session.add_all([fac1, fs1, fs2])

        session.commit()

        # check notification 1
        has_alert_level, new_inspection, update = check_notification_for_group(
                                                    group,
                                                    n2,
                                                    session=session
                                                )
        self.assertTrue(has_alert_level)
        self.assertTrue(new_inspection)
        self.assertTrue(update)

        objs = [sm1, sm2, n1, n2, group, fac1, fac2]
        for obj in objs:
            session.delete(obj)
        
        session.commit()

    @dbconnect
    def test_changedNotificationLength(self, session=None):
        sm1 = ShakeMap(
            shakemap_id = 'shakemap1',
            shakemap_version = 1
        )

        sm2 = ShakeMap(
            shakemap_id = 'shakemap1',
            shakemap_version = 2
        )

        session.add_all([sm1, sm2])

        group = create_group(name='GLOBAL')

        session.add(group)

        n1 = Notification(
            shakemap = sm1
        )

        n2 = Notification(
            shakemap = sm2
        )

        session.add_all([n1, n2])

        fac1 = Facility(
            facility_id = 1
        )

        fac2 = Facility(
            facility_id = 2
        )

        fac3 = Facility(
            facility_id = 3
        )

        fs1 = FacilityShaking(
            shakemap = sm1,
            weight = 1,
            facility = fac1
        )

        fs2 = FacilityShaking(
            shakemap = sm2,
            weight = 1,
            facility = fac2
        )

        fs3 = FacilityShaking(
            shakemap = sm2,
            weight = .1,
            facility = fac3
        )

        session.add_all([fac1, fac2, fac3, fs1, fs2, fs3])

        session.commit()

        # check notification 1
        has_alert_level, new_inspection, update = check_notification_for_group(
                                                    group,
                                                    n2,
                                                    session=session
                                                )
        self.assertTrue(has_alert_level)
        self.assertTrue(new_inspection)
        self.assertTrue(update)

        objs = [sm1, sm2, n1, n2, group, fac1, fac2, fac3]
        for obj in objs:
            session.delete(obj)
        
        session.commit()