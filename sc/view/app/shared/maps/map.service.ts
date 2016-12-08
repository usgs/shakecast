import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs/ReplaySubject';

import { Earthquake } from '../../shakecast/pages/earthquakes/earthquake.service'
import { Facility } from '../../shakecast-admin/pages/facilities/facility.service'

@Injectable()
export class MapService {
    public eqMarkers = new ReplaySubject(1)
    public facMarkers = new ReplaySubject(1)
    public removeFacMarkers = new ReplaySubject(1)
    public center = new ReplaySubject(1)

    plotEq(eq: Earthquake) {
        var eqMarker = this.makeMarker(eq)
        eqMarker['type'] = 'earthquake';
        eqMarker['zoom'] = 8;
        eqMarker['draggable'] = false;

        this.eqMarkers.next([eqMarker]);
        this.center.next(eqMarker);
    }

    plotFac(fac: Facility) {
        var marker = this.makeMarker(fac);
        marker['type'] = 'facility';
        marker['zoom'] = 8;
        marker['draggable'] = false;

        // adjust for facilities having only max/min lat/lon
        marker.lat = (marker.lat_min + marker.lat_max) / 2;
        marker.lon = (marker.lon_min + marker.lon_max) / 2;

        this.facMarkers.next([marker]);
        this.center.next(marker);
    }

    removeFac(fac: Facility) {
        this.removeFacMarkers.next(fac);
    }

    clearMarkers() {
        this.eqMarkers.next([]);
    }

    makeMarker(notMarker: any): Marker {
        var marker: Marker = {
            type: '',
            lat: 0,
            lon: 0,
            draggable: false
        }
        for (var prop in notMarker) {
            marker[prop] = notMarker[prop];
        }
        return marker;
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