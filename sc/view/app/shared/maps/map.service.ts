import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs/ReplaySubject';

import { Earthquake } from '../../shakecast/pages/earthquakes/earthquake.service'

@Injectable()
export class MapService {
    public eqMarkers = new ReplaySubject(1)
    public center = new ReplaySubject(1)

    plotEq(eq: Earthquake) {
        var eqMarker = this.makeMarker(eq)
        eqMarker['type'] = 'earthquake'
        eqMarker['zoom'] = 8
        eqMarker['draggable'] = false

        this.eqMarkers.next([eqMarker])
        this.center.next(eqMarker)
    }

    clearMarkers() {
        this.eqMarkers.next([])
    }

    makeMarker(notMarker: any): Marker {
        var marker: Marker = {
            type: '',
            lat: 0,
            lon: 0,
            draggable: false
        }
        for (var prop in notMarker) {
            marker[prop] = notMarker[prop]
        }
        return marker
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