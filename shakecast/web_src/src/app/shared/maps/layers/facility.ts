import * as L from 'leaflet';
import * as _ from 'underscore';

import 'leaflet-makimarkers';
import 'leaflet.markercluster';

import { Layer } from './layer';

function initIcons() {

    L.MakiMarkers.accessToken = this.mapKey;

    const greyIcon: any = L.MakiMarkers.icon({color: '#808080', size: 'm'});
    const greenIcon: any = L.MakiMarkers.icon({color: '#008000', size: 'm'});
    const yellowIcon: any = L.MakiMarkers.icon({color: '#FFD700', size: 'm'});
    const orangeIcon: any = L.MakiMarkers.icon({color: '#FFA500', size: 'm'});
    const redIcon: any = L.MakiMarkers.icon({color: '#FF0000', size: 'm'});

    const impactIcons = {
      gray: greyIcon,
      green: greenIcon,
      yellow: yellowIcon,
      orange: orangeIcon,
      red: redIcon
    };

    return impactIcons;
}

function addFacMarker(fac: any,
                        silent: boolean = false) {

    // create event marker and plot it
    const marker: any = this.createFacMarker(fac);
    const sc_id = fac.shakecast_id.toString();
    const existingMarker: any = this.data.facilityMarkers[sc_id];

    // Check if the marker already exists
    if (_.isEqual(this.data.facMarker, marker)) {

        // Do nothing. This facility is already selected

    } else if (existingMarker) {
        if (this.data.facilityLayer.hasLayer(this.data.facMarker)) {
            this.data.facilityLayer.removeLayer(this.data.facMarker);
            this.data.facilityCluster.addLayer(this.data.facMarker);
            this.data.facilityCluster.addTo(this.data.facilityLayer);
            this.data.facilityLayer.addTo(this.map);
        }

        this.data.facMarker = existingMarker;
        this.data.facilityCluster.removeLayer(this.data.facMarker);
        this.data.facMarker.addTo(this.data.facilityLayer);
        this.data.facilityLayer.addTo(this.map);
        marker.bindPopup(marker.popupContent)

    } else {
        if (this.data.facilityLayer.hasLayer(this.data.facMarker)) {
            this.data.facilityLayer.removeLayer(this.data.facMarker);
            this.data.facilityCluster.addLayer(this.data.facMarker);
            this.data.facilityCluster.addTo(this.data.facilityLayer);
            this.data.facilityLayer.addTo(this.map);
        }
        this.data.facMarker = marker;
        this.data.facilityMarkers[sc_id] = marker;

        this.data.facMarker.addTo(this.data.facilityLayer);
        this.data.facilityLayer.addTo(this.map);
        marker.bindPopup(marker.popupContent);
    }

    if (silent === false) {
        this.data.facMarker.openPopup();
    }
}

function createFacMarker(fac: any) {
    if (!this.data.impactIcons) {
        this.data.impactIcons = this.initIcons()
    }

    let alert = 'gray';
    if ((fac['shaking']) && (fac['shaking']['alert_level'] !== 'gray')) {
        alert = fac['shaking']['alert_level']
    }

    const marker = L.marker([fac.lat, fac.lon], {icon: this.data.impactIcons[alert]});
    let desc = '';
    if (fac.html) {
        marker['popupContent'] = fac.html;
    } else {
        if (fac.description) {
            desc = fac.description;
        } else {
            desc = 'No Description';
        }

        let colorTable = `
        <table class="colors-table" style="width:100%;text-align:center">
            <tr>
                <th>Fragility</th>
            </tr>
            <tr>
                <td>
                <table style="width:100%">
                    <tr>
                `;

        if (fac['green'] > 0) {
            colorTable += `<th style="background-color:green;padding:2px;color:white">
                        ` + fac['metric']+ ': ' + fac['green'] + ` 
                    </th>`;
        }

        if (fac['yellow'] > 0) {
            colorTable += `<th style="background-color:gold;padding:2px;color:white">
                        ` + fac['metric'] + ': ' + fac['yellow'] + `
                    </th>`;
        }

        if (fac['orange'] > 0) {
            colorTable += `<th style="background-color:orange;padding:2px;color:white">
                        ` + fac['metric'] + ': ' + fac['orange'] + `
                    </th>`;
        }

        if (fac['red'] > 0) {
            colorTable += `<th style="background-color:red;padding:2px;color:white">
                        ` + fac['metric'] + ': ' + fac['red'] + `
                    </th>`;
        }

        colorTable += `</td>
                    </tr>
                </table>
            </tr>
        </table>`

        marker['popupContent'] = `<table style="text-align:center;">
                                    <tr>
                                        <th>` + fac.name + ` </th>
                                    </tr>
                                    <tr>
                                        <td style="font-style:italic;">` +
                                            desc + `
                                        </td>
                                    </tr>
                                    <tr>
                                        <table class="fragility-table">
                                            <tr>
                                                ` + colorTable + `
                                            </tr>
                                        </table>
                                    </tr>
                                </table>`
    }

    if (fac['shaking']) {
        let shakingColor = fac['shaking']['alert_level'];
        if (shakingColor === 'yellow') {
            shakingColor = 'gold';
        }
        marker['popupContent'] += `<table style="border-top:2px solid #444444;width:100%;">
                                        <tr>
                                            <table style="width:90%;margin-left:5%;border-bottom:2px solid #dedede;padding-bottom:0">
                                                <tr>
                                                    <th style="text-align:center">Alert Level</th>
                                                </tr>
                                            </table>
                                        </tr>
                                        <tr>
                                            <table style="width:100%;text-align:center;">
                                                <tr style="background:` + shakingColor + `">
                                                    <th style="text-align:center;color:white">` + fac['shaking']['metric'] + `: ` +
                                                    fac['shaking'][fac['shaking']['metric'].toLowerCase()] + `</th>
                                                </tr>
                                            </table>
                                        </tr>
                                    </table>`;
    }
    marker['facility'] = fac;

    return marker;
}

function removeFacMarker(fac: any) {
  const sc_id = fac.properties.shakecast_id.toString();
  const marker: any = this.data.facilityMarkers[sc_id];

  if (this.data.facilityLayer.hasLayer(marker)) {
      this.data.facilityLayer.removeLayer(marker);
  } else if (this.data.facilityCluster.hasLayer(marker)) {
      this.data.facilityCluster.removeLayer(marker);
  }

  delete this.data.facilityMarkers[sc_id];
}

function createFacCluster(cluster: any) {
    const childCount = cluster.getChildCount();
    const facs = cluster.getAllChildMarkers();

    let c = ' marker-cluster-';
    if (childCount < 10) {
        c += 'small';
    } else if (childCount < 100) {
        c += 'medium';
    } else {
        c += 'large';
    }

    let color_c = '';
    if (facs[0]['facility']['shaking']) {
        let shaking = 'gray';
        for (const fac_id in facs) {
            if ((!_.contains(['green', 'yellow', 'orange', 'red'], shaking)) &&
                    (_.contains(['green', 'yellow', 'orange', 'red'], facs[fac_id]['facility']['shaking']['alert_level']))) {
                shaking = facs[fac_id]['facility']['shaking']['alert_level'];
            } else if ((!_.contains(['yellow', 'orange', 'red'], shaking)) &&
                    (_.contains(['yellow', 'orange', 'red'], facs[fac_id]['facility']['shaking']['alert_level']))) {
                shaking = facs[fac_id]['facility']['shaking']['alert_level'];
            } else if ((!_.contains(['orange', 'red'], shaking)) &&
                    (_.contains(['orange', 'red'], facs[fac_id]['facility']['shaking']['alert_level']))) {
                shaking = facs[fac_id]['facility']['shaking']['alert_level'];
            } else if ((!_.contains(['red'], shaking)) &&
                    (_.contains(['red'], facs[fac_id]['facility']['shaking']['alert_level']))) {
                shaking = facs[fac_id]['facility']['shaking']['alert_level'];
            }
        }

        color_c = 'marker-cluster-' + shaking;
    } else {
        color_c = 'marker-cluster-green';
    }

    return new L.DivIcon({ html: '<div><span>' + childCount + '</span></div>',
        className: 'marker-cluster' + c + ' ' + color_c, iconSize: new L.Point(40, 40) });
}

function clear() {
    this.data = {
        facilityLayer: L.featureGroup(),
        facilityCluster: L.markerClusterGroup({
                            iconCreateFunction: createFacCluster
        }),
        facilityMarkers: {},
        facMarker: L.marker()
    };
}

function layerGenerator(event, facData) {}

class FacilityLayer extends Layer {
    addFacMarker: any = addFacMarker;
    removeFacMarker: any = removeFacMarker;
    createFacMarker: any = createFacMarker;
    initIcons: any = initIcons;
    map: any = null;
    clear: any = clear;

    data: any = {
        facilityLayer: L.featureGroup(),
        facilityCluster: L.markerClusterGroup({
                            iconCreateFunction: createFacCluster
        }),
        facilityMarkers: {},
        facMarker: L.marker()
    };


}

const fLayer = new FacilityLayer('Facility', 'facility', layerGenerator);

fLayer.url = (event) => {
    return 'api/shakemaps/' + event.event_id + '/facilities';
};

export let facilityLayer = fLayer;
