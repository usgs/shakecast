import { Component, OnInit, OnDestroy } from '@angular/core';
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
    public markers: any = [];
    public overlays: any = [];
    public center: any = {};
    private markerLayer: any = L.layerGroup()
    private overlayLayer: any = L.layerGroup()
    private facilityLayer: any= L.layerGroup()
    private subscriptions: any = [];
    private map: any;

    constructor(private mapService: MapService,
                private smService: ShakemapService) {}

    ngOnInit() {
        this.initMap();

        // if eq page
        this.initEqMap();
    }

    initMap() {
        this.map = L.map('map', {
            scrollWheelZoom: false
        }).setView([51.505, -0.09], 8);

        L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            subdomains: ['a','b','c']
        }).addTo(this.map);
    }

    clearLayers() {
        if (this.map.hasLayer(this.markerLayer)) {
            this.map.removeLayer(this.markerLayer)
        }

        if (this.map.hasLayer(this.overlayLayer)) {
            this.map.removeLayer(this.overlayLayer)
        }        
        
        if (this.map.hasLayer(this.facilityLayer)) {
            this.map.removeLayer(this.facilityLayer)
        }
    }

    clearMarkers() {
        if (this.map.hasLayer(this.markerLayer)) {
            this.map.removeLayer(this.markerLayer)
        }
    }

    clearOverlays() {
        if (this.map.hasLayer(this.overlayLayer)) {
            this.map.removeLayer(this.overlayLayer)
        }
    }

    //////////////////////////////////////////////////////////////
    //////////////////// Earthquake Functions ////////////////////
    initEqMap() {
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
    }

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

        this.markerLayer = L.layerGroup([marker]).addTo(this.map);

        marker.bindPopup(popupContent).openPopup();
        // add marker to array -- do we need this still??
        this.markers.push(marker)
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

                // plot facilities if available
                this.plotFacilities(sm)
            }
        });
    }

    plotFacilities(sm: any) {
        this.smService.getFacilities(sm).subscribe((result: any) => {
            if (result.length > 0) {
                var facs: any[] = []
                var popupContent = ''
                for (var fac in result) {
                    var myFac = result[fac]
                    var marker = L.marker([(myFac.lat_min + myFac.lat_max)/2, 
                                            (myFac.lon_min + myFac.lon_max)/2]);


                    popupContent = `<table class="my-table">
                                            <tr>
                                                <th>` + myFac.name + `</th>
                                            </tr>    
                                        </table>`
                    marker.bindPopup(popupContent).openPopup();
                    facs.push(marker)
                } 
                this.facilityLayer = L.layerGroup(facs).addTo(this.map)
            }
        }); 
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