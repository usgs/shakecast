import { Component, onInit } from '@angular/core';
import { MapService, Marker } from './map.service'

import { Earthquake } from '../../shakecast/pages/earthquakes/earthquake.service'

@Component({
    selector: 'my-map',
    templateUrl: 'app/shared/gmaps/map.component.html',
    styleUrls: ['app/shared/gmaps/map.component.css']
})
export class MapComponent implements onInit {
    // google maps zoom level
    zoom: number = 8;
    
    // initial center position for the map
    lat: number;

    lng: number;

    public markers: any = []

    constructor(private mapService: MapService) {}

    ngOnInit() {
        this.mapService.eqMarkers.subscribe(markers =>
            this.markers = markers
        )
    }

}