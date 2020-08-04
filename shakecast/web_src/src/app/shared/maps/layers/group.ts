import * as L from 'leaflet';
import { Layer } from './layer';

function generateGroupPoly(group) {
    const groupLayer_: any = new L.GeoJSON(group);

    const popupStr: string = generatePopup(group);
    groupLayer_.bindPopup(popupStr);

    return groupLayer_;
}

function generatePopup(group) {
    let popupStr = '';
    popupStr += `
            <table "colors-table" style="">
                <tr>
                    <th><h1 style="text-align:center"> ` + group['name'] + `</h1></th>
                </tr>
                <tr>
                    <th>
                        <h3 style="margin:0;border-bottom:2px #444444 solid">Facilities: </h3>
                    </th>
                </tr>
                <tr>
                    <td>
                        <table>`;
/*
    for (const fac_type in group['info']['facilities']) {
        if (group['info']['facilities'].hasOwnProperty(fac_type)) {
            popupStr += `
                            <tr>
                                <th>` + fac_type + `: </th>
                                <td>` + group['info']['facilities'][fac_type] + `</td>
                            </tr>`;
        }
    }

    popupStr += `</table>
                </td>
            </tr>
            <tr>
                <th><h3 style="margin:0;border-bottom:2px #444444 solid">Notification Preferences: </h3></th>
            </tr>
        `;
    if (group['info']['new_event'] > 0) {
        popupStr += `
            <tr>
                <td>
                    <table>
                        <th>New Events with Minimum Magnitude: </th>
                        <td>` + group['info']['new_event'] + `</td>
                    </table>
                </td>
            </tr>
        `;
    }

    if (group['info']['inspection'].length > 0) {
        popupStr += `
            <tr>
                <th style="text-align:center">Facility Alert Levels</th>
            </tr>
            <tr>
                <td>
                    <table style="width:100%;text-align:center">
        `;

        for (var i in group['info']['inspection']) {

            var color = group['info']['inspection'][i]
            if (color == 'yellow') {
                color = 'gold';
            }

            popupStr += '<th style="color:white;padding:3px;border-radius:5px;background:' + 
                            color + 
                            '">' + group['info']['inspection'][i] + '</th>';
        }

        popupStr += '</tr></td></table>';
    }

    if (group['info']['scenario'].length > 0) {
        popupStr += `
            <tr>
                <th style="text-align:center">Scenario Alert Levels</th>
            </tr>
            <tr>
                <td>
                    <table style="width:100%;text-align:center">
        `;

        for (var i in group['info']['scenario']) {

            var color = group['info']['scenario'][i]
            if (color == 'yellow') {
                color = 'gold'
            }

            popupStr += '<th style="color:white;padding:3px;border-radius:5px;background:' + 
                            color + 
                            '">' + group['info']['scenario'][i] + '</th>';
        }

        popupStr += '</tr></td></table>';
    }

    popupStr += `<tr>
                    <table>
                        <th>Template: </th>
                        <td>` + group['info']['template'] + `</td>
                    </table>
                </tr>
            </table>`;
*/
    return popupStr;
}

function layerGenerator(group, product=null) {
    return generateGroupPoly(group);
}

export let groupLayer = new Layer('Group',
                                'group',
                                layerGenerator);

