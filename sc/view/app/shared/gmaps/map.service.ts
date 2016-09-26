import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs/ReplaySubject';

import { Earthquake } from '../../shakecast/pages/earthquakes/earthquake.service'

@Injectable()
export class MapService {
    public eqMarkers = new ReplaySubject(1)
    public center = new ReplaySubject(1)

    plotEq(eq: Earthquake) {
        var eqMarker: Marker = {
            type: 'earthquake',
            lat: Number(eq.lat),
            lon: Number(eq.lon),
            zoom: 10,
            draggable: false,
            label: '<earthquake-blurb></earthquake-blurb>'}
        this.eqMarkers.next([eqMarker])
        this.center.next(eqMarker)
    }

    clearMarkers() {
        this.eqMarkers.next([])
    }
}

// just an interface for type safety.
export interface Marker {
    type: string;
    lat: number;
    lon: number;
    zoom?: number;
    label?: string;
    draggable: boolean;
}