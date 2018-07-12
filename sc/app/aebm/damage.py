from capacity import get_drift, get_modal_height, get_modal_weight, get_modal_response

def get_damage_states(facility):
    states = {
      'slight': 0,
      'moderate': 0,
      'extensive': 0,
      'complete': 0
    }

    modal_height = get_modal_height(
        facility['mbt'],
        facility['floors_ag']
    )

    modal_response = get_modal_response(
        facility['mbt'],
        facility['bid'],
        facility['floors_ag']
    )

    damage_state_medians = {}
    for state in states.keys():
        drift = get_drift(
            facility['mbt'],
            facility['sdl'],
            facility['perf_rating'],
            state
        )

        modal_response_ = modal_response[state]

        states[state] = (
            drift * facility['height'] * 12 * (modal_height / modal_response_)
        )
    return states