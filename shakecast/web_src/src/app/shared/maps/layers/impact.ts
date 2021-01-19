import * as L from 'leaflet';
import * as _ from 'underscore';

import { Layer } from './layer';

import 'leaflet-makimarkers';
import 'leaflet.markercluster';
import { basicFacilityIcon } from './facility';


function generatePopup(fac) {
    const selectShakingTh = "border-top:2px dashed black;border-left:2px dashed black;border-right:2px dashed black;";
    const selectShakingTd = "border-bottom:2px dashed black;border-left:2px dashed black;border-right:2px dashed black;";

    const selectShaking = 'border:2px dashed black';

    const shakingStyles = 'top:100%;transform:translateY(-100%);position:relative;';

    const popup = `
    <div style="min-width:300px;text-align:center">
        <h3 style="margin-bottom:0;">${fac.name}</h3>
        <p style="margin-top:0;font-size:.8em;font-style:italic;">${fac.facility_type}</p>
        <p style="margin-bottom:0;">${fac.description ? fac.description : 'No Description'}</p>
        <p style="margin-top:5px;">${fac.lat}, ${fac.lon}</p>

        <div style="height:4em;width:80%;left:10%;position:relative;display:flex">
            <div style="height:100%;width:18%;margin-left:2%"
                title="${fac.shaking.gray.toFixed(2)}%">
                <div style="${shakingStyles}background:grey;height:${fac.shaking.gray + 5}%;${fac.shaking.alert_level === 'gray' ? selectShaking : ''}"></div>
            </div>
            <div style="height:100%;width:18%;margin-left:2%"
                title="${fac.shaking.green.toFixed(2)}%">
                <div style="${shakingStyles}background:green;height:${fac.shaking.green + 5}%;${fac.shaking.alert_level === 'green' ? selectShaking : ''}"></div>
            </div>
            <div style="height:100%;width:18%;margin-left:2%"
                title="${fac.shaking.yellow.toFixed(2)}%">
                <div style="${shakingStyles}background:gold;height:${fac.shaking.yellow + 5}%;${fac.shaking.alert_level === 'yellow' ? selectShaking : ''}"></div>
            </div>
            <div style="height:100%;width:18%;margin-left:2%"
                title="${fac.shaking.orange.toFixed(2)}%">
                <div style="${shakingStyles}background:orange;height:${fac.shaking.orange + 5}%;${fac.shaking.alert_level === 'orange' ? selectShaking : ''}"></div>
            </div>
            <div style="height:100%;width:18%;margin-left:2%"
                title="${fac.shaking.red.toFixed(2)}%">
                <div style="${shakingStyles}background:red;height:${fac.shaking.red + 5}%;${fac.shaking.alert_level === 'red' ? selectShaking : ''}"></div>
            </div>
        </div>

        <table style="width:100%;padding:5px;margin-top: 5px;background:rgba(0,0,0,.05);border-radius: 5px;">
            <tr>
                <th style="padding:2px;${ fac.shaking.metric === 'MMI' ? selectShakingTh : '' }">
                    ${fac.shaking.mmi ? fac.shaking.mmi : '-'}
                </th>
                <th style="padding:2px;${ fac.shaking.metric === 'PGA' ? selectShakingTh : '' }">
                    ${fac.shaking.pga ? fac.shaking.pga : '-'}
                </th>
                <th style="padding:2px;${ fac.shaking.metric === 'PGV' ? selectShakingTh : '' }">
                    ${fac.shaking.pgv ? fac.shaking.pgv : '-'}
                </th>
                <th style="padding:2px;${ fac.shaking.metric === 'PSA03' ? selectShakingTh : '' }">
                    ${fac.shaking.psa03 ? fac.shaking.psa03 : '-'}
                </th>
                <th style="padding:2px;${ fac.shaking.metric === 'PSA10' ? selectShakingTh : '' }">
                    ${fac.shaking.psa10 ? fac.shaking.psa10 : '-'}
                </th>
                <th style="padding:2px;${ fac.shaking.metric === 'PSA30' ? selectShakingTh : '' }">
                    ${fac.shaking.psa30 ? fac.shaking.psa30 : '-'}
                </th>
            </tr>
            <tr>
                <td style="${ fac.shaking.metric === 'MMI' ? selectShakingTd : '' }">
                    MMI
                </td>
                <td style="${ fac.shaking.metric === 'PGA' ? selectShakingTd : '' }">
                    PGA
                </td>
                <td style="${ fac.shaking.metric === 'PGV' ? selectShakingTd : '' }">
                    PGV
                </td>
                <td style="${ fac.shaking.metric === 'PSA03' ? selectShakingTd : '' }">
                    SA(0.3 s)
                </td>
                <td style="${ fac.shaking.metric === 'PSA10' ? selectShakingTd : '' }">
                    SA(1.0 s)
                </td>
                <td style="${ fac.shaking.metric === 'PSA30' ? selectShakingTd : '' }">
                    SA(3.0 s)
                </td>
            </tr>
        </table>
    </div>
    `;

    return popup;
}

function onEachFeature(feature, layer) {
    // does this feature have a property named popupContent?
    if (feature.properties) {
        layer.bindPopup(generatePopup(feature.properties));
    }
}

function createFacCluster(cluster: any) {
    var childCount = cluster.getChildCount();
    var facs = cluster.getAllChildMarkers();

    var c = ' marker-cluster-';
    if (childCount < 10) {
        c += 'small';
    } else if (childCount < 100) {
        c += 'medium';
    } else {
        c += 'large';
    }

    var color_c = ''
    var shaking = 'gray';
    for (let eachFac of facs) {
        let fac = eachFac.feature.properties;

        if ((!_.contains(['green', 'yellow', 'orange', 'red'], shaking)) &&
                (_.contains(['green', 'yellow', 'orange', 'red'], fac['shaking']['alert_level']))) {
            shaking = fac['shaking']['alert_level'];
        } else if ((!_.contains(['yellow', 'orange', 'red'], shaking)) &&
                (_.contains(['yellow', 'orange', 'red'], fac['shaking']['alert_level']))) {
            shaking = fac['shaking']['alert_level'];
        } else if ((!_.contains(['orange', 'red'], shaking)) &&
                (_.contains(['orange', 'red'], fac['shaking']['alert_level']))) {
            shaking = fac['shaking']['alert_level'];
        } else if ((!_.contains(['red'], shaking)) &&
                (_.contains(['red'], fac['shaking']['alert_level']))) {
            shaking = fac['shaking']['alert_level'];
        }
    }

    color_c = 'marker-cluster-' + shaking;

    return new L.DivIcon({ html: '<div><span>' + childCount + '</span></div>', className: 'marker-cluster' + c + ' ' + color_c, iconSize: new L.Point(40, 40) });
}

function layerGenerator(event, facData) {
    const geoJsonLayer = L.geoJson(facData, {
        onEachFeature: onEachFeature,
        pointToLayer: function (feature, latlng) {
          const fillColor = feature.properties.shaking.alert_level;
          const icon_ = L.divIcon({
            className: 'custom-div-icon',
              html: `<i style="color:${fillColor}" class="fa fa-3x fa-lg fa-map-marker">`, // overwrite when assigned
              iconSize:     [20, 20], // size of the icon
              iconAnchor:   [11, 5], // point of the icon which will correspond to marker's location
              popupAnchor:  [0, 0] // point from which the popup should open relative to the iconAnchor
          });

         return L.marker(latlng, {icon: icon_});
        }
    });


    const facilityCluster = L.markerClusterGroup({
                            iconCreateFunction: createFacCluster
    })

    facilityCluster.addLayer(geoJsonLayer);

    return facilityCluster;
}

let fLayer = new Layer('Facility Shaking', 'impact', layerGenerator);

fLayer.url = (event) => {
    return 'api/shakemaps/' + event.properties.event_id + '/impact';
};

export let impactLayer = fLayer;
