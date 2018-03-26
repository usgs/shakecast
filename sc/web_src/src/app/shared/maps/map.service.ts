import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs/ReplaySubject';

import { HttpClient } from '@angular/common/http';
import { Earthquake } from '../../shakecast/pages/earthquakes/earthquake.service';
import { Facility } from '../../shakecast-admin/pages/facilities/facility.service';
import { Group } from '../../shakecast-admin/pages/groups/group.service';
import { User } from '../../shakecast-admin/pages/users/users.service';

import { map } from 'rxjs/operators';


@Injectable()
export class MapService {
    public eqMarker = new ReplaySubject(1)
    public facMarkers = new ReplaySubject(1)
    public groupPoly = new ReplaySubject(1)
    public removeFacMarkers = new ReplaySubject(1)
    public clearMapNotify = new ReplaySubject(1)
    public center = new ReplaySubject(1)
    
    constructor(private _http: HttpClient) {}

    plotEq(eq: Earthquake,
           clear: any = null) {
        var eqMarker = this.makeMarker(eq)
        eqMarker['type'] = 'earthquake';
        eqMarker['zoom'] = 8;
        eqMarker['draggable'] = false;

        this.eqMarker.next(eqMarker);
    }

    makeFacMarker(fac: Facility,
            clear: boolean = false) {
        var marker = this.makeMarker(fac);
        marker['type'] = 'facility';
        marker['zoom'] = 8;
        marker['draggable'] = false;

        // adjust for facilities having only max/min lat/lon
        marker.lat = (marker['lat_min'] + marker['lat_max']) / 2;
        marker.lon = (marker['lon_min'] + marker['lon_max']) / 2;

        return marker;
    }

    makeFacMarkers(facs: Facility[],
             clear: boolean = true) {
        var markers = Array(facs.length);
        for (var fac_id in facs) {
            var fac = facs[fac_id];
            var marker = this.makeMarker(fac);
            marker['type'] = 'facility';
            marker['zoom'] = 8;
            marker['draggable'] = false;

            // adjust for facilities having only max/min lat/lon
            marker.lat = (marker['lat_min'] + marker['lat_max']) / 2;
            marker.lon = (marker['lon_min'] + marker['lon_max']) / 2;

            markers[fac_id] = marker;
        }
        this.facMarkers.next(markers);
    }

    plotGroup(group: Group) {

        this.groupPoly.next(group);
    }

    plotUser(user: User,
             clear: boolean = false) {

    }

    setCenter(marker: any) {
        this.center.next(marker);
    }

    removeFac(fac: Facility) {
        this.removeFacMarkers.next(fac);
    }

    clearMarkers() {
        //this.eqMarkers.next([]);
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



    clearMap() {
        this.clearMapNotify.next(true)
    }

    getMapKey() {
        return this._http.get('/api/map-key')
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

export interface Poly {
    type: string;
    properties: any
    geometry: any
}