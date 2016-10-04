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
    private subscriptions: any = [];
    private map: any;

    constructor(private mapService: MapService,
                private smService: ShakemapService) {}

    ngOnInit() {
        this.map = L.map('map').setView([51.505, -0.09], 8);

        L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            subdomains: ['a','b','c'],
            scrollWheelZoom: false
        }).addTo(this.map);

        // subscribe to earthquake markers
        this.subscriptions.push(this.mapService.eqMarkers.subscribe(markers => {
            
// CLEAR THE MARKERS
            if (this.map.hasLayer(this.markerLayer)) {
                this.map.removeLayer(this.markerLayer)
            }

            if (this.map.hasLayer(this.overlayLayer)) {
                this.map.removeLayer(this.overlayLayer)
            }

            for (var mark in markers) {

                var marker = L.marker([markers[mark].lat, markers[mark].lon]).addTo(this.map);

                var popupContent = `<table class="my-table">    
    <tr>
        <th>ID:</th>
        <td>` + markers[mark].event_id + `</td>
    </tr>
    <tr> 
        <th>Magnitude:</th>
        <td>` + markers[mark].magnitude + `</td>
    </tr>
    <tr>
        <th>Depth:</th>
        <td>` + markers[mark].depth + `</td>
    </tr>
    <tr>
        <th>Latitude:</th>
        <td>` + markers[mark].lat + `</td>
    </tr>
    <tr>
        <th>Longitude:</th>
        <td>` + markers[mark].lon + `</td>
    </tr>
    <tr>
        <th>Description:</th>
        <td>` + markers[mark].place + `</td>
    </tr>
</table>`

                this.markerLayer = L.layerGroup([marker]).addTo(this.map);

                marker.bindPopup(popupContent).openPopup();
                // add marker to array -- do we need this still??
                this.markers.push(marker)

                // plot shakemap if available
                this.smService.shakemapCheck(markers[mark]).subscribe((result: any) => {
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
        }));

        // subscribe to center
        this.subscriptions.push(this.mapService.center.subscribe(center => {
            this.center = center
            this.map.setView([center.lat,center.lon], 8)
        }));
    }

    ngOnDestroy() {
        for (var sub in this.subscriptions) {
            this.subscriptions[sub].unsubscribe()
        }
    }

}