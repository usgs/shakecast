import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router'
import { Marker } from './map.service';
import { ShakemapService } from './shakemap.service'
import { MapService } from './map.service'
import { FacilityService } from '../../shakecast-admin/pages/facilities/facility.service';
import { LoadingService } from '../../loading/loading.service';
import { NotificationsService } from 'angular2-notifications';
declare var L: any;

L.MakiMarkers.accessToken = 'pk.eyJ1IjoiZHNsb3NreSIsImEiOiJjaXR1aHJnY3EwMDFoMnRxZWVtcm9laWJmIn0.1C3GE0kHPGOpbVV9kTxBlQ'

declare var _: any;

@Component({
    selector: 'my-map',
    templateUrl: 'app/shared/maps/map.component.html',
    styleUrls: ['app/shared/maps/map.component.css', 'https://unpkg.com/leaflet@1.0.1/dist/leaflet.css']
}) 

export class MapComponent implements OnInit, OnDestroy {
    public markers: any = {};
    public overlays: any = [];
    public eventMarkers: any = [];
    public facilityMarkers: any = {};
    public center: any = {};
    private mapKey: string = null
    private markerLayer: any = L.featureGroup();
    private eventMarker: any = L.marker();
    private eventLayer: any = L.featureGroup();
    private overlayLayer: any = L.layerGroup();
    private facilityCluster: any = L.markerClusterGroup({
	                                iconCreateFunction: this.createFacCluster
                                    });
    private facilityLayer: any = L.featureGroup();
    private facMarker: any = L.marker();
    private groupLayers: any = L.featureGroup();
    private subscriptions: any = [];
    private map: any;
    private epicIcon: any  = L.icon({iconUrl: 'static/epicenter.png',
                                    iconSize:     [45, 45], // size of the icon
                                    shadowSize:   [50, 64], // size of the shadow
                                    popupAnchor:  [1, -25] // point from which the popup should open relative to the iconAnchor
                             });
    public shakingData: any = null
    public totalShaking: number = 0;
    public greyIcon: any = L.MakiMarkers.icon({color: "#808080", size: "m"});
    public greenIcon: any = L.MakiMarkers.icon({color: "#008000", size: "m"});
    public yellowIcon: any = L.MakiMarkers.icon({color: "#FFD700", size: "m"});
    public orangeIcon: any = L.MakiMarkers.icon({color: "#FFA500", size: "m"});
    public redIcon: any = L.MakiMarkers.icon({color: "#FF0000", size: "m"});

    constructor(private mapService: MapService,
                private smService: ShakemapService,
                private facService: FacilityService,
                private notService: NotificationsService,
                private _router: Router,
                private loadingService: LoadingService,
                private changeDetector: ChangeDetectorRef) {}

    ngOnInit() {
        this.subscriptions.push(this.mapService.getMapKey().subscribe((key: string) => {
            this.mapKey = key
            this.initMap();
        }));
    }

    initMap() {
        var this_: any = this;
        this.map = L.map('map', {
            scrollWheelZoom: false
        }).setView([51.505, -0.09], 8);

        L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=' + this.mapKey, {
			maxZoom: 18,
			attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
				'<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
				'Imagery � <a href="http://mapbox.com">Mapbox</a>',
			id: 'mapbox.streets'
		}).addTo(this.map);

        var layers: any  = {
            'Facility': this.facilityLayer,
            'Event': this.eventLayer
        }
        L.control.layers(null,layers).addTo(this.map);

        // subscribe to earthquake markers
        this.subscriptions.push(this.mapService.eqMarkers.subscribe(eqData => {
            if (eqData) {
                if (eqData['clear']) {
                    if (eqData['clear'] == 'all') {
                        // clear all layers
                        this.clearLayers();
                    } else if (eqData['clear'] == 'events') {
                        this.clearEventLayers();
                    }
                }
                for (var mark in eqData['events']) {
                    this.plotEventMarker(eqData['events'][mark]);
                }
            }
        }));

        // subscribe to center
        this.subscriptions.push(this.mapService.center.subscribe(center => {
            this.center = center;
            if (center['type'] === 'facility') {
                this.map.setView([center.lat,center.lon]);
            } else {
                this.map.setView([center.lat + .5,center.lon], 8);
            }
        }));

        // subscribe to facility markers
        this.subscriptions.push(this.mapService.facMarkers.subscribe((markers: any[]) => {
                this.loadingService.add('Facility Markers');
                var silent: boolean = (markers.length > 1)
                for (var mark in markers) {
                    this.plotFacMarker(markers[mark], silent);
                }

                if (silent === false) {
                    this.map.setView([markers[0].lat + .5, markers[0].lon]);
                }
                this.loadingService.finish('Facility Markers');
        }));

        // subscribe to REMOVING facility markers
        this.subscriptions.push(this.mapService.removeFacMarkers.subscribe(fac => {
            this.removeFacMarker(fac);
        }));

        // subscribe to group poly
        this.subscriptions.push(this.mapService.groupPoly.subscribe(groupPoly => {
                this.plotGroup(groupPoly);
        }));

        // subscribe to clearing the map
        this.subscriptions.push(this.mapService.clearMapNotify.subscribe(notification => {
            this.clearLayers();

            // stop fetching facilities if this is still working...
            // if (this.facService.sub) {
            //     this.facService.sub.unsubscribe();
            // }
        }));

        // subscribe to facility data to create a total shaking div
        this.subscriptions.push(this.facService.shakingData.subscribe((shaking: any) => {
            this.shakingData = shaking;

            if (shaking) {
                this.totalShaking = shaking['gray'] + 
                                        shaking['green'] + 
                                        shaking['yellow'] + 
                                        shaking['orange'] + 
                                        shaking['red'];
            } else {
                this.totalShaking = 0;
            }
        }));
    }

    //////////////////////////////////////////////////////////////
    //////////////////// Earthquake Functions ////////////////////
    plotEventMarker(event: any) {
        // create event marker and plot it
        this.eventMarker = this.createEventMarker(event);

        this.eventMarker.addTo(this.eventLayer);
        this.eventLayer.addTo(this.map);

        this.eventMarker.bindPopup(this.eventMarker.popupContent).openPopup();

        this.eventMarkers.push(this.eventMarker)
        // plot shakemap if available
        this.plotShakemap(event);
    }

    createEventMarker(event: any) {
        var marker: any = L.marker([event.lat, event.lon], {icon: this.epicIcon});

        marker['popupContent'] = `<table class="my-table">    
                                <tr>
                                    <th>ID:</th>
                                    <td>` + event.event_id + `</td>
                                </tr>
                                <tr> 
                                    <th>Magnitude:</th>
                                    <td>` + event.magnitude + `</td>
                                </tr>
                                <tr>
                                    <th>Depth:</th>
                                    <td>` + event.depth + `</td>
                                </tr>
                                <tr>
                                    <th>Latitude:</th>
                                    <td>` + event.lat + `</td>
                                </tr>
                                <tr>
                                    <th>Longitude:</th>
                                    <td>` + event.lon + `</td>
                                </tr>
                                <tr>
                                    <th>Description:</th>
                                    <td>` + event.place + `</td>
                                </tr>
                            </table>`

        return marker
    }

    plotLastEvent() {
        if (this.eventMarkers.length > 0) {
            var marker: any = this.eventMarkers[this.eventMarkers.length - 1] 
            this.map.setView(marker.getLatLng());
            marker.openPopup()
        }
    }

    plotShakemap(event: any) {
        this.smService.shakemapCheck(event).subscribe((result: any) => {
            if (result.length > 0){
                this.loadingService.add('ShakeMap');
                this.changeDetector.detectChanges();
                // plot shakemaps
                var sm = result[0]
                var imageUrl = 'api/shakemaps/' + sm.shakemap_id + '/overlay';
                var imageBounds = [[sm.lat_min, sm.lon_min], [sm.lat_max, sm.lon_max]];

                try {
                    if (this.eventLayer.hasLayer(this.overlayLayer)) {
                        this.eventLayer.removeLayer(this.overlayLayer);
                    }
                    this.overlayLayer = L.imageOverlay(imageUrl, 
                                    imageBounds, 
                                    {opacity: .6})
                    this.overlayLayer.addTo(this.eventLayer);
                    if (this.map.hasLayer(this.eventLayer)) {
                        this.eventLayer.addTo(this.map)
                        this.map.fitBounds(this.eventLayer.getBounds())
                    }
                }
                catch(e) {
                    this.notService.alert('Shakemap Error', 'Unable to retreive shakemap')
                }
                this.loadingService.finish('ShakeMap');
                this.changeDetector.detectChanges();
            }
        });
    }

    //////////////////////////////////////////////////////////////
    ///////////////////// Facility Functions /////////////////////
    plotFacMarker(fac: any,
                  silent: boolean = false) {
        // create event marker and plot it
        var marker: any = this.createFacMarker(fac);
        var existingMarker: any = this.facilityMarkers[fac.shakecast_id.toString()];

        // Check if the marker already exists
        if (_.isEqual(this.facMarker, marker)) {
            //this.facMarker.openPopup();
        } else if (existingMarker) {
            if (this.facilityLayer.hasLayer(this.facMarker)) {
                this.facilityLayer.removeLayer(this.facMarker);
                this.facilityCluster.addLayer(this.facMarker);
                this.facilityCluster.addTo(this.facilityLayer);
                this.facilityLayer.addTo(this.map);
            }

            this.facMarker = existingMarker;
            this.facilityCluster.removeLayer(this.facMarker);
            this.facMarker.addTo(this.facilityLayer);
            this.facilityLayer.addTo(this.map);
            marker.bindPopup(marker.popupContent)
            //marker.openPopup();

        } else {
            if (this.facilityLayer.hasLayer(this.facMarker)) {
                this.facilityLayer.removeLayer(this.facMarker);
                this.facilityCluster.addLayer(this.facMarker);
                this.facilityCluster.addTo(this.facilityLayer);
                this.facilityLayer.addTo(this.map);
            }
            this.facMarker = marker;
            this.facilityMarkers[fac.shakecast_id.toString()] = marker;

            this.facMarker.addTo(this.facilityLayer);
            this.facilityLayer.addTo(this.map);
            marker.bindPopup(marker.popupContent)
            //marker.openPopup();
        }

        if (silent === false) {
            this.facMarker.openPopup();
        }
    }

    createFacMarker(fac: any) {
        if (fac['shaking']) {
            if (fac['shaking']['alert_level'] == 'gray') {
                var marker: any = L.marker([fac.lat, fac.lon], {icon: this.greyIcon});
            } else if (fac['shaking']['alert_level'] == 'gray') {
                var marker: any = L.marker([fac.lat, fac.lon], {icon: this.greyIcon});
            } else if (fac['shaking']['alert_level'] == 'green') {
                var marker: any = L.marker([fac.lat, fac.lon], {icon: this.greenIcon});
            } else if (fac['shaking']['alert_level'] == 'yellow') {
                var marker: any = L.marker([fac.lat, fac.lon], {icon: this.yellowIcon});
            } else if (fac['shaking']['alert_level'] == 'orange') {
                var marker: any = L.marker([fac.lat, fac.lon], {icon: this.orangeIcon});
            } else if (fac['shaking']['alert_level'] == 'red') {
                var marker: any = L.marker([fac.lat, fac.lon], {icon: this.redIcon});
            }

        } else {
            var marker: any = L.marker([fac.lat, fac.lon], {icon: this.greyIcon});
        }

        var desc: string = ''
        if (fac.html) {
            marker['popupContent'] = fac.html
        } else {
            if (fac.description) {
                desc = fac.description
            } else {
                desc = 'No Description'
            }

            var colorTable = `
            <table class="colors-table" style="width:100%;text-align:center">
                <tr>
                    <th>Fragility</th>
                </tr>
                <tr>
                    <td>
                    <table style="width:100%">
                        <tr>
                    `

            if (fac['green'] > 0) {
                colorTable += `<th style="background-color:green;padding:2px;color:white">
                            ` + fac['metric']+ ': ' + fac['green'] + ` 
                        </th>`
            } 
            
            if (fac['yellow'] > 0) {
                colorTable += `<th style="background-color:gold;padding:2px;color:white">
                            ` + fac['metric']+ ': ' + fac['yellow'] + ` 
                        </th>`
            } 
            
            if (fac['orange'] > 0) {
                colorTable += `<th style="background-color:orange;padding:2px;color:white">
                            ` + fac['metric']+ ': ' + fac['orange'] + ` 
                        </th>`
            } 
            
            if (fac['red'] > 0) {
                colorTable += `<th style="background-color:red;padding:2px;color:white">
                            ` + fac['metric']+ ': ' + fac['red'] + ` 
                        </th>`
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
            var shakingColor = fac['shaking']['alert_level']
            if (shakingColor == 'yellow') {
                shakingColor = 'gold'
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
                                                        <th style="text-align:center;color:white">` + fac['shaking']['metric'] + `: ` + fac['shaking'][fac['shaking']['metric'].toLowerCase()] + `</th>
                                                    </tr>
                                                </table>
                                            </tr>
                                        </table>`
        }
        marker['facility'] = fac;
        return marker
    }

    removeFacMarker(fac: any) {
        var marker: any = this.facilityMarkers[fac.shakecast_id.toString()];
    
        if (this.facilityLayer.hasLayer(marker)) {
            this.facilityLayer.removeLayer(marker);
        } else if (this.facilityCluster.hasLayer(marker)) {
            this.facilityCluster.removeLayer(marker)
        }

        delete this.facilityMarkers[fac.shakecast_id.toString()]
        if (this._router.url == '/shakecast/dashboard') {
            if (Object.keys(this.facilityMarkers).length == 0) {
                this.plotLastEvent();
            }
        }
    }

    plotGroup(group: any) {
        var groupLayer: any = new L.GeoJSON(group);
        var popupStr: string = ''
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
                        <table>`

        for (var fac_type in group['info']['facilities']) {
            if (group['info']['facilities'].hasOwnProperty(fac_type)) {
                popupStr += `
                                <tr>
                                    <th>` + fac_type + `: </th>
                                    <td>` + group['info']['facilities'][fac_type] + `</td>
                                </tr>`
            }
        }

        popupStr += `</table>
                    </td>
                </tr>
                <tr>
                    <th><h3 style="margin:0;border-bottom:2px #444444 solid">Notification Preferences: </h3></th>
                </tr>
            `
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
            `
        }

        if (group['info']['inspection'].length > 0) {
            popupStr += `
                <tr>
                    <th style="text-align:center">Facility Alert Levels</th>
                </tr>
                <tr>
                    <td>
                        <table style="width:100%;text-align:center">
            `

            for (var i in group['info']['inspection']) {

                var color = group['info']['inspection'][i]
                if (color == 'yellow') {
                    color = 'gold'
                }

                popupStr += '<th style="color:white;padding:3px;border-radius:5px;background:' + 
                                color + 
                                '">' + group['info']['inspection'][i] + '</th>';
            }

            popupStr += '</tr></td></table>'
        }

        if (group['info']['scenario'].length > 0) {
            popupStr += `
                <tr>
                    <th style="text-align:center">Scenario Alert Levels</th>
                </tr>
                <tr>
                    <td>
                        <table style="width:100%;text-align:center">
            `

            for (var i in group['info']['scenario']) {

                var color = group['info']['scenario'][i]
                if (color == 'yellow') {
                    color = 'gold'
                }

                popupStr += '<th style="color:white;padding:3px;border-radius:5px;background:' + 
                                color + 
                                '">' + group['info']['scenario'][i] + '</th>';
            }

            popupStr += '</tr></td></table>'
        }

        popupStr += `<tr>
                        <table>
                            <th>Template: </th>
                            <td>` + group['info']['template'] + `</td>
                        </table>
                    </tr>
                </table>`
        groupLayer.bindPopup(popupStr);
        this.groupLayers.addLayer(groupLayer);
        this.map.addLayer(this.groupLayers);
        this.map.fitBounds(this.groupLayers.getBounds());
        groupLayer.openPopup()
    }

    clearEventLayers() {
        if (this.eventLayer.hasLayer(this.eventMarker)) {
            this.eventLayer.removeLayer(this.eventMarker);
        }

        if (this.eventLayer.hasLayer(this.overlayLayer)) {
            this.eventLayer.removeLayer(this.overlayLayer);
            this.overlayLayer = L.imageOverlay();
        }
    }

    clearLayers() {
        /*
        Clear all layers besides basemaps
        */
        this.clearEventLayers();

        if (this.map.hasLayer(this.markerLayer)) {
            this.map.removeLayer(this.markerLayer);
            this.markerLayer = L.featureGroup();
        }

        if (this.facilityLayer.hasLayer(this.facilityCluster)) {
            this.facilityLayer.removeLayer(this.facilityCluster);
            this.facilityCluster = L.markerClusterGroup({
	                                    iconCreateFunction: this.createFacCluster
                                    });
        }

        if (this.facilityLayer.hasLayer(this.facMarker)) {
            this.facilityLayer.removeLayer(this.facMarker);
            this.facMarker= L.marker();
        }

        if (this.map.hasLayer(this.groupLayers)) {
            this.map.removeLayer(this.groupLayers);
            this.groupLayers = L.featureGroup();
        }

        this.eventMarkers = [];
        this.facilityMarkers = [];
        this.totalShaking = 0;
    }

    createFacCluster(cluster: any) {
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
        if (facs[0]['facility']['shaking']) {
            var shaking = 'gray';
            for (var fac_id in facs) {
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

		return new L.DivIcon({ html: '<div><span>' + childCount + '</span></div>', className: 'marker-cluster' + c + ' ' + color_c, iconSize: new L.Point(40, 40) });
    }

    ngOnDestroy() {
        this.endSubscriptions();
    }

    endSubscriptions() {
        for (var sub in this.subscriptions) {
            this.subscriptions[sub].unsubscribe();
        }
    }

}