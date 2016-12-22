import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router'
import { Marker } from './map.service';
import { ShakemapService } from './shakemap.service'
import { MapService } from './map.service'
declare var L: any;

@Component({
    selector: 'my-map',
    templateUrl: 'app/shared/maps/map.component.html',
    styleUrls: ['app/shared/maps/map.component.css', 'https://unpkg.com/leaflet@1.0.1/dist/leaflet.css']
}) 

export class MapComponent implements OnInit, OnDestroy {
    public markers: any = {};
    public overlays: any = [];
    public eventMarkers: any = [];
    public facilityMarkers: any = [];
    public center: any = {};
    private markerLayer: any = L.layerGroup()
    private eventLayer: any = L.layerGroup()
    private overlayLayer: any = L.layerGroup()
    private facilityLayer: any = L.markerClusterGroup()
    private groupLayer: any = L.geoJson()
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
            this.map.setView([center.lat + .5,center.lon], 8);
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

    clearLayers() {
        /*
        Clear all layers besides basemaps
        */
        
        if (this.map.hasLayer(this.markerLayer)) {
            this.map.removeLayer(this.markerLayer);
            this.markerLayer = L.layerGroup()
        }

        if (this.map.hasLayer(this.eventLayer)) {
            this.map.removeLayer(this.eventLayer);
            this.eventLayer = L.layerGroup()
        }

        if (this.map.hasLayer(this.overlayLayer)) {
            this.map.removeLayer(this.overlayLayer);
            this.overlayLayer = L.layerGroup()
        }        
        
        if (this.map.hasLayer(this.facilityLayer)) {
            this.map.removeLayer(this.facilityLayer);
            this.facilityLayer = L.markerClusterGroup()
        }

        if (this.map.hasLayer(this.groupLayer)) {
            this.map.removeLayer(this.groupLayer);
            this.groupLayer = L.layerGroup()
        }

        this.eventMarkers = [];
        this.facilityMarkers = [];
    }

    //////////////////////////////////////////////////////////////
    //////////////////// Earthquake Functions ////////////////////
    plotEventMarker(marker: any) {
        // create event marker and plot it
        this.createEventMarker(marker)
        // plot shakemap if available
        this.plotShakemap(marker)
    }

    createEventMarker(event: any) {
        var marker: any = L.marker([event.lat, event.lon]);

        var popupContent = `<table class="my-table">    
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

        this.markerLayer = L.layerGroup([marker]).addTo(this.eventLayer);
        this.eventLayer.addTo(this.map)
        marker.bindPopup(popupContent).openPopup();
        
        this.eventMarkers.push(marker)
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
    plotFacMarker(marker: any) {
        // create event marker and plot it
        this.createFacMarker(marker)
    }

    createFacMarker(fac: any) {
        var marker: any = L.marker([fac.lat, fac.lon]);
        var popupContent = fac.name
    
        this.facilityLayer.addLayer(marker);
        marker.bindPopup(popupContent).openPopup();
        this.facilityMarkers[fac.shakecast_id.toString()] = marker;

        this.facilityLayer.addTo(this.map)
    }

    removeFacMarker(fac: any) {
        var marker: any = this.facilityMarkers[fac.shakecast_id.toString()];
    
        if (marker) {
            this.facilityLayer.removeLayer(marker);
            var index: number = this.facilityMarkers.indexOf(marker);
            if (index > -1) {
                this.facilityMarkers.splice(index, 1);
            }
        }

        if (this._router.url == '/shakecast/dashboard') {
            if (Object.keys(this.facilityMarkers).length == 0) {
                this.plotLastEvent();
            }
        }
    }

    plotGroup(group: any) {
        this.clearLayers();

        this.groupLayer = new L.GeoJSON(group);
        this.map.addLayer(this.groupLayer);
        this.map.fitBounds(this.groupLayer.getBounds());
    }

    ////////// Clean Up Before Closing //////////
    ngOnDestroy() {
        this.endSubscriptions()
    }

    endSubscriptions() {
        for (var sub in this.subscriptions) {
            this.subscriptions[sub].unsubscribe()
        }
    }

}