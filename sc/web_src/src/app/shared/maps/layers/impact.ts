import * as L from 'leaflet';
import * as _ from 'underscore';

import { Layer } from './layer';

import 'leaflet-makimarkers';
import 'leaflet.markercluster';

var myStyle = {
    "color": "#000000",
    "weight": 2,
    "opacity": 1,
    "fillOpacity": 1,
    "fillColor": '#ffffff',
    'radius': 8
};

function generatePopup(fac) {
    return fac.facility_name
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
    var geoJsonLayer = L.geoJson(facData, {
        onEachFeature: onEachFeature,
        pointToLayer: function (feature, latlng) {
            let style = myStyle;
            style.fillColor = feature.properties.shaking.alert_level;

            return L.circleMarker(latlng, myStyle);
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
    return '/api/shakemaps/' + event.event_id + '/impact';
}

export let impactLayer = fLayer;