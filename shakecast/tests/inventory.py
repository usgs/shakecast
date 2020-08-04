import os
import unittest

from shakecast.app.inventory import *
from shakecast.app.orm import Session, Facility, Group, User
from shakecast.app.util import sc_dir
class TestImport(unittest.TestCase):
    '''
    Run tests on the XML import functions
    '''
    def step01_clearData(self):
        '''
        Clear the user, group, and facility data from the test database
        '''
        session = Session()
        users = session.query(User).all()
        groups = session.query(Group).all()
        facilities = session.query(Facility).all()
        
        user_ids = [user.shakecast_id for user in users]
        group_ids = [group.shakecast_id for group in groups]
        facility_ids = [facility.shakecast_id for facility in facilities]

        delete_inventory_by_id(inventory_type='user', ids=user_ids)
        delete_inventory_by_id(inventory_type='group', ids=group_ids)
        delete_inventory_by_id(inventory_type='facility', ids=facility_ids)

        users = session.query(User).all()
        groups = session.query(Group).all()
        facilities = session.query(Facility).all()
        self.assertEqual(users, [])
        self.assertEqual(groups, [])
        self.assertEqual(facilities, [])

        Session.remove()

    @dbconnect
    def step02_userImport(self, session=None):
        user_file = os.path.join(sc_dir(), 'tests', 'data', 'test_users.xml')
        file_type = determine_xml(user_file)
        import_user_xml(user_file)

        users = session.query(User).all()
        id1 = users[0].shakecast_id
        id2 = users[1].shakecast_id

        import_user_xml(user_file, id1)
        import_user_xml(user_file, id2)

        self.assertEqual(file_type, 'user')
        user = session.query(User).filter(User.username == 'Ex3').first()

        self.assertEqual(user.mms, 'example@example.com')

    def step03_groupImport(self):
        group_file = os.path.join(sc_dir(), 'tests', 'data', 'test_groups.xml')
        file_type = determine_xml(group_file)
        import_group_xml(group_file, 1)
        self.assertEqual(file_type, 'group')
        
    def step04_facImport(self):
        fac_file = os.path.join(sc_dir(), 'tests', 'data', 'test_facs.xml')
        file_type = determine_xml(fac_file)
        import_facility_xml(fac_file, 1)
        self.assertEqual(file_type, 'facility')

    def step05_checkUser(self):
        session = Session()
        users = session.query(User).all()
        
        failed = False
        failed_str = ''
        if len(users) != 3:
            failed_str += 'Incorrect number of users: {}'.format(len(users))
            failed = True
        for user in users:
            if user.username == 'Ex1':
                if len(user.groups) != 0:
                    failed_str += '\nIncorrect number of groups: {}, {}'.format(user.username, len(user.groups))
                    failed = True
            elif user.username == 'Ex2':
                if len(user.groups) != 1:
                    failed_str += '\nIncorrect number of groups: {}, {}'.format(user.username, len(user.groups))
                    failed = True
            elif user.username == 'Ex3':
                if len(user.groups) != 3:
                    failed_str += '\nIncorrect number of groups: {}, {}'.format(user.username, len(user.groups))
                    failed = True
        
        if failed is True:
            raise ValueError(failed_str)        
        
        Session.remove()
        
    def step06_checkGroup(self):
        session = Session()
        groups = session.query(Group).all()
        
        failed = False
        failed_str = ''
        if len(groups) != 3:
            failed_str += '\nIncorrect number of groups: {}'.format(len(groups))
            failed = True
        
        for group in groups:
            if group.name == 'DU':
                if len(group.users) != 1:
                    failed_str += '\nIncorrect number of users: {}, {}'.format(group.name, len(group.users))
                    failed = True
                min_mag = group.get_min_mag()
                self.assertTrue(min_mag > 0)
                self.assertTrue(group.check_min_mag(10))

            elif group.name == 'CAL_BRIDGES':
                if len(group.users) != 2:
                    failed_str += '\nIncorrect number of users: {}, {}'.format(group.name,
                                                                               len(group.users))
                    failed = True

                self.assertTrue(group.has_alert_level('green'))
                self.assertTrue('green' in group.get_alert_levels())
            elif group.name == 'CAL_BRIDGES_SCENARIO':
                if len(group.users) != 1:
                    failed_str += '\nIncorrect number of users: {}, {}'.format(group.name,
                                                                               len(group.users))
                    failed = True
                self.assertTrue(group.gets_notification('new_event', scenario=True))
                self.assertTrue(group.gets_notification('damage', scenario=True))
                self.assertTrue('green' in group.get_scenario_alert_levels())
                self.assertTrue('gray' in group.get_alert_levels(scenario=True))
                self.assertTrue('grey' in group.get_alert_levels(scenario=True))

            self.assertEqual('Ex1', group.updated_by)
        
        if failed is True:
            raise ValueError(failed_str)
        
        Session.remove()
        
    def step07_checkFacs(self):
        session = Session()
        facs = session.query(Facility).all()
        
        failed = False
        failed_str = ''
        if len(facs) != 3:
            failed_str += '\nIncorrect number of facs: {}'.format(len(facs))
            failed = True
            
        for fac in facs:
            if fac.facility_id == 1:
                if len(fac.groups) != 2:
                    failed_str += '\nIncorrect number of groups: {}, {}'.format(fac.facility_id,
                                                                                len(facs))
                    failed = True
            elif fac.facility_id == 2:
                if len(fac.groups) != 1:
                    failed_str += '\nIncorrect number of groups: {}, {}'.format(fac.facility_id,
                                                                                len(facs))
                    failed = True
          
            self.assertEqual('Ex1', fac.updated_by)

        if failed is True:
            raise ValueError(failed_str)
                    
        Session.remove()

    def step08_userImport2(self):
        self.step02_userImport()
        
    def step09_groupImport2(self):
        self.step03_groupImport()
        
    def step10_facImport2(self):
        self.step04_facImport()
                
    def step11_removeData(self):
        self.step01_clearData()

    def step12_masterImport(self):
        file_ = os.path.join(sc_dir(), 'tests', 'data', 'test_master.xml')
        file_type = determine_xml(file_)
        import_master_xml(file_)

        self.assertEqual(file_type, 'master')

    def step13_facilityInfo(self):
        info = get_facility_info(group_name='bad_group', shakemap_id='no_shakemap')
        self.assertEqual({}, info)
        
    def steps(self):
        '''
        Generates the step methods from their parent object
        '''
        for name in sorted(dir(self)):
            if name.startswith('step'):
                yield name, getattr(self, name)
    
    def test_steps(self):
        '''
        Run the individual steps associated with this test
        '''
        # Create a flag that determines whether to raise an error at
        # the end of the test
        failed = False
        
        # An empty string that the will accumulate error messages for 
        # each failing step
        fail_message = ''
        for name, step in self.steps():
            try:
                step()
            except Exception as e:
                # A step has failed, the test should continue through
                # the remaining steps, but eventually fail
                failed = True
                
                # get the name of the method -- so the fail message is
                # nicer to read :)
                name = name.split('_')[1]
                # append this step's exception to the fail message
                fail_message += "\n\nFAIL: {}\n {} failed ({}: {})".format(name,
                                                                           step,
                                                                           type(e),
                                                                           e)
        
        # check if any of the steps failed
        if failed is True:
            # fail the test with the accumulated exception message
            self.fail(fail_message)

class TestImportFacilities(unittest.TestCase):

    @dbconnect
    def test_AebmImport(self, session):
        xml_file = os.path.join(sc_dir(), 'tests', 'data', 'aebm_fac.xml')
        import_facility_xml(xml_file)

        facility = session.query(Facility).filter(Facility.name == 'AEBM Campus').first()
        self.assertIsNotNone(facility)

    @dbconnect
    def test_geoJSON(self, session):
        xml_file = os.path.join(sc_dir(), 'tests', 'data', 'aebm_fac.xml')
        import_facility_xml(xml_file)

        facility = session.query(Facility).filter(Facility.name == 'AEBM Campus').first()
        self.assertIsNotNone(facility.aebm)
        self.assertIsNotNone(facility.geojson)
    
    @dbconnect
    def test_FacilityImport(self, session):
        fac_file = os.path.join(sc_dir(), 'tests', 'data', 'test_facs.xml')
        file_type = determine_xml(fac_file)
        import_facility_xml(fac_file, 1)

        self.assertEqual(file_type, 'facility')

    @dbconnect
    def test_AttributeImport(self, session):
        xml_file = os.path.join(sc_dir(), 'tests', 'data', 'attribute_fac.xml')
        import_facility_xml(xml_file)

        facility = session.query(Facility).filter(Facility.name == 'Attribute Campus').first()
        self.assertIsNotNone(facility)
        self.assertTrue(len(facility.attributes) > 0)

class TestImportGroups(unittest.TestCase):
    @dbconnect
    def test_groupImport(self, session):
      group_file = os.path.join(sc_dir(), 'tests', 'data', 'test_groups.xml')
      file_type = determine_xml(group_file)
      import_group_xml(group_file, 1)
      self.assertEqual(file_type, 'group')

    @dbconnect
    def test_geoJSON(self, session):
      group_file = os.path.join(sc_dir(), 'tests', 'data', 'test_groups.xml')
      file_type = determine_xml(group_file)
      import_group_xml(group_file, 1)

      group = session.query(Group).first()
      self.assertIsNotNone(group.geojson)



if __name__ == '__main__':
    unittest.main()