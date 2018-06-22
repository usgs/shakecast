import math
import sanaz
from spectrum import build_spectrum

def get_b_eff(capacity, kappa):
    last_b_h = 0;
    b_eff = [0] * len(capacity['curve'])
    b_eff[0] = [{'x': 0, 'y': capacity['b_e'] * 100}]

    for i in range(len(capacity['curve'])):
        point = capacity['curve'][i]

        if i > 0:
            prev_point = capacity['curve'][i - 1]
        else:
            prev_point = None

        t = 0;
        if point['y'] > 0:
            t = math.sqrt(point['x'] /
                    (9.779738 * point['y']));
        
        if point['x'] >= capacity['t_e'] and prev_point is not None:
            b_h = 100 * (kappa * ( 2*(point['y'] + prev_point['y']) *
                        (point['x']-(prev_point['x'] + (capacity['d_y']/capacity['a_y']) *
                        (point['y']-prev_point['y'])))+(((last_b_h/100)/kappa)) *
                        2 * math.pi * prev_point['x']*prev_point['y'])/(2*math.pi*point['x']*point['y']))
            last_b_h = b_h;
          
            b_eff[i] = {'x': t, 'y': max(b_h, capacity['b_e'] * 100)};
        else:
            b_eff[i] = {'x': t, 'y': (capacity['b_e'] * 100)};

    return b_eff

def get_dsf(beta, mag, rRup):
    dsf = []
    for i in range(len(beta)):
        lnDSF = ((sanaz.b0[i]['y'] + sanaz.b1[i]['y']*math.log(beta[i]['y']) + sanaz.b2[i]['y']*((math.log(beta[i]['y']))**2)) +
                        (sanaz.b3[i]['y'] + sanaz.b4[i]['y']*math.log(beta[i]['y']) + sanaz.b5[i]['y']*((math.log(beta[i]['y']))**2)) * mag +
                        (sanaz.b6[i]['y'] + sanaz.b7[i]['y']*math.log(beta[i]['y']) + sanaz.b8[i]['y']*((math.log(beta[i]['y']))**2)) * math.log(rRup+1));
        
        dsf += [{'x': beta[i]['x'], 'y': round(math.exp(lnDSF), 3)}];

    return dsf

def damp(demand, capacity, mag, rRup):
    kappa = get_kappa(mag, rRup)
    b_eff = get_b_eff(capacity, kappa)

    beta = build_spectrum(b_eff, sanaz.t);
    dsf = get_dsf(beta, mag, rRup)

    # expand dsf to match demand spectrum periods
    dsf = build_spectrum(dsf, [point['x'] for point in demand])

    for i in range(len(demand)):
        damp_disp = demand[i]['disp'] * dsf[i]['y'];
        damp_acc = damp_disp/(9.779738 * demand[i]['x']**2);

        demand[i] = {'disp': damp_disp, 'y': damp_acc, 'x': demand[i]['x']};

    return demand

def get_kappa(mag, rRup):
    return .5

