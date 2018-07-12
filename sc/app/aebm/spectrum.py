from math import log

def build_spectrum(input, pref, insert=None, start_val=None, finish_val=None):
    '''
    @param input (list) of points [{'x': x_val, 'y', y_val}, ...]
    @param pref (list) of x values to be included in the expanded spectrum
    @param insert (list) of additional x values
    '''

    # add values to the prefered spectrum
    if insert is not None:
        pref = insert_vals(pref, insert)

    # strip any duplicates
    pref = list(set(pref))

    # sort the prefered values
    pref.sort()

    # determine which points are missing and add them to the
    # input spectrum
    input_xs = [point['x'] for point  in input]
    missing = [{'x': t, 'y': None} for t in pref
            if t not in input_xs]

    expanded_spectrum = input + missing

    # sort the spectrum
    expanded_spectrum = sorted(expanded_spectrum, key=lambda p: p['x'])

    if finish_val is not None:
        last_x = expanded_spectrum[-1]['x']
        expanded_spectrum += [{'x':  last_x * 10, 'y': finish_val}]

    if start_val is not None:
        first_x = expanded_spectrum[0]['x']
        expanded_spectrum = [{'x':  first_x / 10, 'y': start_val}] + expanded_spectrum

    for idx in range(len(expanded_spectrum)):
        if expanded_spectrum[idx]['y'] is None:
            known_points = [point for point in expanded_spectrum[idx:]
                    if point['y'] is not None]
            # interpolation needed
            if idx == 0:
                # grab two forward points
                p1 = known_points[0]
                p2 = known_points[1]

            elif len(known_points) == 0:
                # grab two backward points
                p1 = expanded_spectrum[idx - 2]
                p2 = expanded_spectrum[idx - 1]
            else:
                p1 = expanded_spectrum[idx - 1]
                p2 = known_points[0]

            expanded_spectrum[idx]['y'] = interpolate(
                expanded_spectrum[idx]['x'],
                p1,
                p2
            )

    filtered_spectrum = [point for point in expanded_spectrum if point['x'] in pref]

    return filtered_spectrum
          
        
def interpolate(interpX, p1, p2):
    # swap input points if they're in the wrong order
    if p1['x'] > p2['x']:
      p1, p2 = p2, p1

    x1 = p1['x'] if p1['x'] != 0 else .000000000001
    y1 = p1['y'] if p1['y'] != 0 else .000000000001
    x2 = p2['x'] if p2['x'] != 0 else .000000000001
    y2 = p2['y'] if p2['y'] != 0 else .000000000001

    val = (y1 * (1 - (log(interpX) - log(x1)) / (log(x2) - log(x1))) + 
            y2 * ((log(interpX) - log(x1)) / (log(x2) - log(x1))))
    
    return val

def insert_vals(lst, vals):
    lst = sorted(list(set(lst)))
    vals = sorted(list(set(vals)))

    for val in vals:
        for i in range(len(lst)):
            dif = lst[i] - val
            if dif > 0:
                if i == 0:
                    lst[0] = val
                else:
                    if abs(lst[i] - val) > abs(lst[i-1] - val):
                        lst[i-1] = val
                    else:
                        lst[i] = val

                break
    return lst

