import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router'
import { Marker } from './map.service';
import { ShakemapService } from './shakemap.service'
import { MapService } from './map.service'
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
    private eventLayer: any = L.layerGroup();
    private overlayLayer: any = L.layerGroup();
    private facilityCluster: any = L.markerClusterGroup();
    private facilityLayer: any = L.layerGroup();
    private facMarker: any = L.marker();
    private groupLayers: any = L.featureGroup();
    private subscriptions: any = [];
    private map: any;

    constructor(private mapService: MapService,
                private smService: ShakemapService,
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
            'Facility': this.facilityLayer
        }
        L.control.layers(null,layers).addTo(this.map);

        // subscribe to earthquake markers
        this.subscriptions.push(this.mapService.eqMarkers.subscribe(markers => {
            // clear existing layers
            this.clearLayers();

                for (var mark in markers) {
                    this.plotEventMarker(markers[mark]);
                }
        }));

        // subscribe to center
        this.subscriptions.push(this.mapService.center.subscribe(center => {
            this.center = center;
            if (center['type'] === 'facility') {
                this.map.setView([center.lat,center.lon]);
            } else {
                this.map.setView([center.lat + .5,center.lon]);
            }
        }));

        // subscribe to facility markers
        this.subscriptions.push(this.mapService.facMarkers.subscribe(markers => {
                for (var mark in markers) {
                    this.plotFacMarker(markers[mark]);
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
    }

    //////////////////////////////////////////////////////////////
    //////////////////// Earthquake Functions ////////////////////
    plotEventMarker(event: any) {
        // create event marker and plot it
        var marker: any = this.createEventMarker(event)

        marker.addTo(this.eventLayer);
        this.eventLayer.addTo(this.map)
        marker.bindPopup(marker.popupContent).openPopup();
        
        this.eventMarkers.push(marker)
        // plot shakemap if available
        this.plotShakemap(marker)
    }

    createEventMarker(event: any) {
        var marker: any = L.marker([event.lat, event.lon]);

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
            if (result.length > 0) {
                // plot shakemaps
                var sm = result[0]
                var imageUrl = 'api/shakemaps/' + sm.shakemap_id + '/overlay';
                var imageBounds = [[sm.lat_min, sm.lon_min], [sm.lat_max, sm.lon_max]];

                
                var overlay = L.imageOverlay(imageUrl, 
                                imageBounds, 
                                {opacity: .6})

                this.overlayLayer = L.layerGroup([overlay]).addTo(this.map)
            }
        });
    }

    //////////////////////////////////////////////////////////////
    ///////////////////// Facility Functions /////////////////////
    plotFacMarker(fac: any) {
        // create event marker and plot it
        var marker: any = this.createFacMarker(fac);
        var existingMarker: any = this.facilityMarkers[fac.shakecast_id.toString()];

        // Check if the marker already exists
        if (_.isEqual(this.facMarker, marker)) {
            this.facMarker.openPopup();
        } else if (existingMarker) {
            existingMarker.openPopup();
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
            marker.bindPopup(marker.popupContent).openPopup();
            this.facilityLayer.addTo(this.map);
        }
    }

    createFacMarker(fac: any) {
        var marker: any = L.marker([fac.lat, fac.lon]);
        var desc: string = ''
        if (fac.html) {
            fac['popupContent'] = fac.html
        } else {
            if (fac.description) {
                desc = fac.description
            } else {
                desc = 'No Description'
            }
            marker['popupContent'] = `<table style="text-align:center;">
                                        <tr>
                                            <th>` + 
                                                fac.name + `
                                            </th>
                                        </tr>
                                        <tr>
                                            <td style="font-style:italic;">` +
                                                desc + `
                                            </td>
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
        
        this.groupLayers.addLayer(groupLayer);
        this.map.addLayer(this.groupLayers);
        this.map.fitBounds(this.groupLayers.getBounds());
    }

    clearLayers() {
        /*
        Clear all layers besides basemaps
        */
        
        if (this.map.hasLayer(this.markerLayer)) {
            this.map.removeLayer(this.markerLayer);
            this.markerLayer = L.layerGroup();
        }

        if (this.map.hasLayer(this.eventLayer)) {
            this.map.removeLayer(this.eventLayer);
            this.eventLayer = L.layerGroup();
        }

        if (this.map.hasLayer(this.overlayLayer)) {
            this.map.removeLayer(this.overlayLayer);
            this.overlayLayer = L.layerGroup();
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
    }

    ngOnDestroy() {
        this.endSubscriptions()
    }

    endSubscriptions() {
        for (var sub in this.subscriptions) {
            this.subscriptions[sub].unsubscribe()
        }
    }

}