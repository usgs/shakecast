declare function require(string): string;

import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router'
import { Marker } from './map.service';
import { MapService } from './map.service'
import { EarthquakeService } from '../../shakecast/pages/earthquakes/earthquake.service';
import { LayerService } from './layers/layer.service'
import { FacilityService } from '../../shakecast-admin/pages/facilities/facility.service';
import { LoadingService } from '../../loading/loading.service';
import { NotificationsService } from 'angular2-notifications';

import * as L from 'leaflet';
import 'leaflet-makimarkers';
import 'leaflet.markercluster';

import * as _ from 'underscore';


@Component({
    selector: 'my-map',
    templateUrl: './map.component.html',
    styleUrls: ['./map.component.css']
}) 

export class MapComponent implements OnInit, OnDestroy {
    public layersControl = null;
    public markers: any = {};
    public overlays: any = [];
    public eventMarkers: any = [];
    public facilityMarkers: any = {};
    public center: any = {};
    private mapKey: string = null
    private markerLayer: any = L.featureGroup();

    private onMap: any[] = [];
    
    private facilityCluster: any = L.markerClusterGroup({
	                                iconCreateFunction: this.createFacCluster
                                    });
                                    
    //private facilityCluster: any = L.featureGroup();
    private facilityLayer: any = L.featureGroup();
    private facMarker: any = L.marker();
    private groupLayers: any = L.featureGroup();
    private subscriptions: any = [];
    private map: any;
    private epicIcon: any  = L.icon({iconUrl: 'assets/epicenter.png',
                                    iconSize:     [45, 45], // size of the icon
                                    shadowSize:   [50, 64], // size of the shadow
                                    popupAnchor:  [1, -25] // point from which the popup should open relative to the iconAnchor
                             });
    public shakingData: any = null
    public totalShaking: number = 0;

    public impactIcons: any = {}

    constructor(private mapService: MapService,
                private facService: FacilityService,
                private notService: NotificationsService,
                private _router: Router,
                private loadingService: LoadingService,
                private changeDetector: ChangeDetectorRef,
                private eqService: EarthquakeService,
                private layerService: LayerService) {}

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

        let basemap = this.getBasemap();
        basemap.addTo(this.map);
        var layers: any  = {
            'Facility': this.facilityLayer
        }
        
        L.MakiMarkers.accessToken = this.mapKey
        const greyIcon: any = L.MakiMarkers.icon({color: "#808080", size: "m"});
        const greenIcon: any = L.MakiMarkers.icon({color: "#008000", size: "m"});
        const yellowIcon: any = L.MakiMarkers.icon({color: "#FFD700", size: "m"});
        const orangeIcon: any = L.MakiMarkers.icon({color: "#FFA500", size: "m"});
        const redIcon: any = L.MakiMarkers.icon({color: "#FF0000", size: "m"});

        this.impactIcons = {
            gray: greyIcon,
            green: greenIcon,
            yellow: yellowIcon,
            orange: orangeIcon,
            red: redIcon
        }

        this.layersControl = L.control.layers(null,layers).addTo(this.map);

        this.subscriptions.push(this.eqService.selectEvent.subscribe((event) => {
            this.onEvent(event);
        }));

        this.subscriptions.push(this.mapService.groupPoly.subscribe(group => {
            this.onGroup(group);
        }));

        this.subscriptions.push(this.layerService.nextLayer.subscribe((layer) => {
            this.onLayer(layer);
        }));

        // subscribe to center
        this.subscriptions.push(this.mapService.center.subscribe(center => {
            this.center = center;
            if (center['type'] === 'facility') {
                this.map.setView([center['lat'],center['lon']]);
            } else {
                this.map.setView([center['lat'] + .5,center['lon']], 8);
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
                    this.map.setView([markers[0]['lat'] + .5, markers[0]['lon']]);
                }
                this.loadingService.finish('Facility Markers');
        }));

        // subscribe to REMOVING facility markers
        this.subscriptions.push(this.mapService.removeFacMarkers.subscribe(fac => {
            this.removeFacMarker(fac);
        }));

        // subscribe to clearing the map
        this.subscriptions.push(this.mapService.clearMapNotify.subscribe(notification => {
            this.clearLayers();
        }));
    }

    onEvent(event) {
        if (event === null) {
            return;
        } else {
            this.layerService.genEventLayers(event);
        }
    }

    onGroup(group) {
        this.layerService.genGroupLayers(group);
    }

    onLayer(layer) {
        layer['layer'].addTo(this.map);
        this.onMap.push(layer);

        // align map
        const layers = []
        for (let layer in this.onMap) {
            layers.push(this.onMap[layer].layer)
        }
        let group = L.featureGroup(layers);
        this.map.fitBounds(group.getBounds().pad(0.1));
    }

    getBasemap() {
        return L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=' + this.mapKey, {
			maxZoom: 18,
			attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
				'<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
				'Imagery � <a href="http://mapbox.com">Mapbox</a>',
			id: 'mapbox.streets'
		})
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
        let alert = 'gray'
        if ((fac['shaking']) && (fac['shaking']['alert_level'] !== 'gray')) {
            alert = fac['shaking']['alert_level']
        }

        var marker = L.marker([fac.lat, fac.lon], {icon: this.impactIcons[alert]});
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
    }



    clearEventLayers() {
        this.clearLayers();
    }

    clearLayers() {
        /*
        Clear all layers besides basemaps
        */
        if (this.layersControl) {
            this.layersControl.remove();
        }

        this.map.eachLayer(layer => {
            this.map.removeLayer(layer);
        });

        this.markerLayer = L.featureGroup();
        this.facilityCluster = L.markerClusterGroup({
	                                iconCreateFunction: this.createFacCluster
                                    });
        this.facMarker= L.marker();
        this.groupLayers = L.featureGroup();
        this.facilityMarkers = [];
        this.totalShaking = 0;
        this.facilityLayer = L.featureGroup();

        this.onMap = []

        let basemap = this.getBasemap();
        basemap.addTo(this.map);
        var layers: any  = {
            'Facility': this.facilityLayer
        }
        
        this.layersControl = L.control.layers(null,layers).addTo(this.map);
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