import json
import os
from shakecast.api.controllers.util import get_file_type
import time

from flask import (
    request,
    jsonify
)
from flask_login import (
    current_user,
    login_required
)

from shakecast.app.inventory import determine_xml
from shakecast.app.orm import *
from shakecast.ui import UI

from .adminonly import admin_only
from .blueprint import routes
from .uploadsets import image_files, xml_files

ui = UI()

@routes.route('/api/facilities', methods=['DELETE'])
@login_required
def delete_faclities():
    inventory = json.loads(request.args.get('inventory', None))

    if inventory is None:
      return jsonify(success=True)

    inv_ids = [inv['properties']['shakecast_id'] for inv in inventory]
    inv_type = 'facility'
    if len(inv_ids) > 0 and inv_type is not None:
        ui.send("{'delete_inventory: %s': {'func': f.delete_inventory_by_id, \
                        'args_in': {'ids': %s, 'inventory_type': '%s'}, \
                        'db_use': True, \
                        'loop': False}}" % (inv_type, inv_ids, inv_type))

    return jsonify(success=True)

@routes.route('/api/inventory/delete', methods=['DELETE'])
@login_required
def delete_inventory():
    inventory = json.loads(request.args.get('inventory', None))

    if inventory is None:
      return jsonify(success=True)

    inv_ids = [inv['shakecast_id'] for inv in inventory if inv['shakecast_id']]
    inv_type = request.args.get('inventory_type', None)
    if len(inv_ids) > 0 and inv_type is not None:
        ui.send("{'delete_inventory: %s': {'func': f.delete_inventory_by_id, \
                        'args_in': {'ids': %s, 'inventory_type': '%s'}, \
                        'db_use': True, \
                        'loop': False}}" % (inv_type, inv_ids, inv_type))

    return jsonify(success=True)

@routes.route('/api/groups', methods=['DELETE'])
@login_required
def delete_groups():
    inventory = json.loads(request.args.get('inventory', None))

    if inventory is None:
      return jsonify(success=True)

    inv_ids = [inv['properties']['shakecast_id'] for inv in inventory]
    inv_type = 'group'
    if len(inv_ids) > 0 and inv_type is not None:
        ui.send("{'delete_inventory: %s': {'func': f.delete_inventory_by_id, \
                        'args_in': {'ids': %s, 'inventory_type': '%s'}, \
                        'db_use': True, \
                        'loop': False}}" % (inv_type, inv_ids, inv_type))

    return jsonify(success=True)

@routes.route('/api/users', methods=['POST'])
@login_required
@dbconnect
def post_users(session=None):
    users = request.json.get('users')
    if not users:
        return jsonify(False)

    if users is not None:
        ui.send("{'import_user_dicts': {'func': f.import_user_dicts, \
                                        'args_in': {'users': %s, '_user': %s}, \
                                        'db_use': True, 'loop': False}}" % (users, 
                                                                            current_user.shakecast_id))

    return jsonify(users)

@routes.route('/api/scenario-download/<event_id>', methods=['GET'])
@admin_only
@login_required
def scenario_download(event_id):
    scenario = json.loads(request.args.get('scenario', 'false'))
    if event_id:
        ui.send("{'scenario_download: %s': {'func': f.download_scenario, 'args_in': {'shakemap_id': r'%s', 'scenario': %s}, 'db_use': True, 'loop': False}}" % (event_id, event_id, scenario))

    return json.dumps({'success': True})

@routes.route('/api/scenario-delete/<event_id>', methods=['DELETE'])
@admin_only
@login_required
def scenario_delete(event_id):
    if event_id:
        ui.send("{'scenario_delete: %s': {'func': f.delete_scenario, 'args_in': {'shakemap_id': r'%s'}, 'db_use': True, 'loop': False}}" % (event_id, event_id))
    
    return json.dumps({'success': True})

@routes.route('/api/scenario-run/<event_id>', methods=['POST'])
@admin_only
@login_required
def scenario_run(event_id):
    if event_id:
        ui.send("{'scenario_run: %s': {'func': f.run_scenario, 'args_in': {'shakemap_id': r'%s'}, 'db_use': True, 'loop': False}}" % (event_id, event_id))
    
    return json.dumps({'success': True})

@routes.route('/api/upload/', methods=['POST'])
@admin_only
@login_required
def upload():
    file_type = get_file_type(request.files['file'].filename)
    if file_type == 'xml':
        file_name = str(int(time.time())) + request.files['file'].filename
        xml_files.save(request.files['file'], name=file_name)
        xml_file = os.path.join(app.config['UPLOADED_XMLFILES_DEST'],
                                file_name)
        # validate XML and determine which import function should be used
        xml_file_type = determine_xml(xml_file)
        
        # these import functions need to be submitted to the server instead
        # of run directly
        func_name = ''

        func_name = 'import_' + xml_file_type + '_xml'
        if xml_file_type is not None:
            ui.send("{'%s': {'func': f.%s, 'args_in': {'xml_file': r'%s', '_user': %s}, 'db_use': True, 'loop': False}}" % (func_name, 
                                                                                                                func_name, 
                                                                                                                xml_file,
                                                                                                current_user.shakecast_id))
    elif file_type == 'image':
        image_files.save(request.files['file'])

    return 'file uploaded'

@routes.route('/api/system-test')
@admin_only
@login_required
def system_test():
    ui = UI()
    result = ui.send("{'System Test': {'func': f.system_test, 'args_in': {}, 'db_use': True, 'loop': False}}")

    return json.dumps(result)

@routes.route('/api/restart')
def restart():
    result = ui.send("{'Restart': {'func': self.restart, 'args_in': {}, 'db_use': True, 'loop': False}}")
    return json.dumps(result)
