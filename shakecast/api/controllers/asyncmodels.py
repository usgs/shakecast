import json
import os
import time

from flask import request, jsonify
from flask_login import (
    login_required
)

from shakecast.app.env import USER_TMP_DIR
from shakecast.app.eventprocessing import run_scenario
from shakecast.app.productdownload import download_scenario
from shakecast.app.inventory import (
    delete_scenario,
    delete_inventory_by_id,
    determine_xml,
    import_facility_xml,
    import_group_xml,
    import_master_xml,
    import_user_dicts,
    import_user_xml
)
from shakecast.app.orm.utils import dbconnect

from .adminonly import admin_only
from .blueprint import routes
from .uploadsets import xml_files, image_files
from .util import get_file_type, record_messages

@routes.route('/api/scenario-download/<event_id>', methods=['GET'])
@admin_only
@login_required
def async_scenario_download(event_id):
    scenario = json.loads(request.args.get('scenario', 'false'))
    if event_id:
        result = download_scenario(event_id, scenario)

    record_messages(result['message'])
    return json.dumps(result)

@routes.route('/api/scenario-delete/<event_id>', methods=['DELETE'])
@admin_only
@login_required
def async_scenario_delete(event_id):
    if event_id:
        result = delete_scenario(event_id)
    
    record_messages(result['message'])
    return json.dumps({'success': True})


@routes.route('/api/scenario-run/<event_id>', methods=['POST'])
@admin_only
@login_required
def async_scenario_run(event_id):
    if event_id:
        result = run_scenario(event_id)
    
    record_messages(result['message'])
    return json.dumps({'success': True})


@routes.route('/api/facilities', methods=['DELETE'])
@login_required
def async_delete_faclities():
    inventory = json.loads(request.args.get('inventory', None))

    if inventory is None:
      return jsonify(success=True)

    inv_ids = [inv['properties']['shakecast_id'] for inv in inventory]
    inv_type = 'facility'
    if len(inv_ids) > 0 and inv_type is not None:
        result = delete_inventory_by_id(inv_type, inv_ids)

    record_messages(result['message'])
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
        result = delete_inventory_by_id(inv_type, inv_ids)

    record_messages(result['message'])
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
        result = delete_inventory_by_id(inv_type, inv_ids)

    record_messages(result['message'])
    return jsonify(success=True)

@routes.route('/api/users', methods=['POST'])
@login_required
@dbconnect
def post_users(session=None):
    users = request.json.get('users')
    if not users:
        return jsonify(False)

    result = import_user_dicts(users)

    record_messages(result['message'])
    return jsonify(users)

@routes.route('/api/upload/', methods=['POST'])
@admin_only
@login_required
def upload():
    file_type = get_file_type(request.files['file'].filename)
    if file_type == 'xml':
        file_name = str(int(time.time())) + request.files['file'].filename
        xml_files.save(request.files['file'], name=file_name)
        xml_file = os.path.join(USER_TMP_DIR, file_name)
        # validate XML and determine which import function should be used
        xml_file_type = determine_xml(xml_file)

        if xml_file_type == 'user':
          result = import_user_xml(xml_file)
        elif xml_file_type == 'facility':
          result = import_facility_xml(xml_file)
        elif xml_file_type == 'group':
          result = import_group_xml(xml_file)
        elif xml_file_type == 'master':
          result = import_master_xml(xml_file)

    elif file_type == 'image':
        image_files.save(request.files['file'])

    record_messages(result['message'])
    return 'file uploaded'
