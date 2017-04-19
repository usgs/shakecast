import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router'
import { Marker } from './map.service';
import { ShakemapService } from './shakemap.service'
import { MapService } from './map.service'
import { FacilityService } from '../../shakecast-admin/pages/facilities/facility.service';

declare var L: any;
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
    private markerLayer: any = L.layerGroup();
    private eventMarker: any = L.marker();
    private eventLayer: any = L.layerGroup();
    private overlayLayer: any = L.layerGroup();
    private facilityCluster: any = L.markerClusterGroup();
    private facilityLayer: any = L.layerGroup();
    private facMarker: any = L.marker();
    private groupLayers: any = L.featureGroup();
    private subscriptions: any = [];
    private map: any;
    private epicIcon: any  = L.icon({iconUrl: 'images/epicenter.png',
                                    iconSize:     [45, 45], // size of the icon
                                    shadowSize:   [50, 64], // size of the shadow
                                    popupAnchor:  [1, -25] // point from which the popup should open relative to the iconAnchor
                             });
    public shakingData: any = null
    public totalShaking: number = 0;

    constructor(private mapService: MapService,
                private smService: ShakemapService,
                private facService: FacilityService,
                private _router: Router) {}

    ngOnInit() {
        this.initMap();
    }

    initMap() {
        this.map = L.map('map', {
            scrollWheelZoom: false
        }).setView([51.505, -0.09], 8);

        L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            subdomains: ['a','b','c']
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
                var silent: boolean = (markers.length > 1)
                for (var mark in markers) {
                    this.plotFacMarker(markers[mark], silent);
                }

                if (silent === false) {
                    this.map.setView([markers[0].lat + .5, markers[0].lon]);
                }
        }));

        // subscribe to group poly
        this.subscriptions.push(this.mapService.groupPoly.subscribe(groupPoly => {
                this.plotGroup(groupPoly);
        }));

        // subscribe to REMOVING facility markers
        this.subscriptions.push(this.mapService.removeFacMarkers.subscribe(fac => {
            this.removeFacMarker(fac);
        }));

        // subscribe to clearing the map
        this.subscriptions.push(this.mapService.clearMapNotify.subscribe(notification => {
            this.clearLayers();
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
                // plot shakemaps
                var sm = result[0]
                var imageUrl = 'api/shakemaps/' + sm.shakemap_id + '/overlay';
                var imageBounds = [[sm.lat_min, sm.lon_min], [sm.lat_max, sm.lon_max]];

                
                this.overlayLayer = L.imageOverlay(imageUrl, 
                                imageBounds, 
                                {opacity: .6})

                this.overlayLayer.addTo(this.eventLayer);
                if (this.map.hasLayer(this.eventLayer)) {
                    this.eventLayer.addTo(this.map)
                }
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
        var marker: any = L.marker([fac.lat, fac.lon]);
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
                colorTable += `<th style="background-color:green;padding:2px">
                            ` + fac['metric']+ ': ' + fac['green'] + ` 
                        </th>`
            } 
            
            if (fac['yellow'] > 0) {
                colorTable += `<th style="background-color:yellow;padding:2px">
                            ` + fac['metric']+ ': ' + fac['yellow'] + ` 
                        </th>`
            } 
            
            if (fac['orange'] > 0) {
                colorTable += `<th style="background-color:orange;padding:2px">
                            ` + fac['metric']+ ': ' + fac['orange'] + ` 
                        </th>`
            } 
            
            if (fac['red'] > 0) {
                colorTable += `<th style="background-color:red;padding:2px">
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
                                                    <tr style="background:` + fac['shaking']['alert_level'] + `">
                                                        <th style="text-align:center;color:white">` + fac['shaking']['metric'] + `: ` + fac['shaking'][fac['shaking']['metric'].toLowerCase()] + `</th>
                                                    </tr>
                                                </table>
                                            </tr>
                                        </table>`
        }
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
        groupLayer.bindPopup(group['name'])
        this.groupLayers.addLayer(groupLayer);
        this.map.addLayer(this.groupLayers);
        this.map.fitBounds(this.groupLayers.getBounds());
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
            this.markerLayer = L.layerGroup();
        }

        if (this.facilityLayer.hasLayer(this.facilityCluster)) {
            this.facilityLayer.removeLayer(this.facilityCluster);
            this.facilityCluster = L.markerClusterGroup();
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

    ngOnDestroy() {
        this.endSubscriptions();
    }

    endSubscriptions() {
        for (var sub in this.subscriptions) {
            this.subscriptions[sub].unsubscribe();
        }
    }

}