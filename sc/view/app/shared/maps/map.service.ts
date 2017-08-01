import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs/ReplaySubject';

import { Http, Response } from '@angular/http';
import { Earthquake } from '../../shakecast/pages/earthquakes/earthquake.service';
import { Facility } from '../../shakecast-admin/pages/facilities/facility.service';
import { Group } from '../../shakecast-admin/pages/groups/group.service';
import { User } from '../../shakecast-admin/pages/users/users.service';

@Injectable()
export class MapService {
    public eqMarkers = new ReplaySubject(1)
    public facMarkers = new ReplaySubject(1)
    public groupPoly = new ReplaySubject(1)
    public removeFacMarkers = new ReplaySubject(1)
    public clearMapNotify = new ReplaySubject(1)
    public center = new ReplaySubject(1)
    
    constructor(private _http: Http) {}

    plotEq(eq: Earthquake,
           clear: any = null) {
        var eqMarker = this.makeMarker(eq)
        eqMarker['type'] = 'earthquake';
        eqMarker['zoom'] = 8;
        eqMarker['draggable'] = false;

        this.eqMarkers.next({events: [eqMarker], clear: clear});
        this.center.next(eqMarker);
    }

    plotFac(fac: Facility,
            clear: boolean = false) {
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

    plotFacs(facs: Facility[],
             clear: boolean = true) {
        var markers = Array(facs.length);
        for (var fac_id in facs) {
            var fac = facs[fac_id];
            var marker = this.makeMarker(fac);
            marker['type'] = 'facility';
            marker['zoom'] = 8;
            marker['draggable'] = false;

            // adjust for facilities having only max/min lat/lon
            marker.lat = (marker.lat_min + marker.lat_max) / 2;
            marker.lon = (marker.lon_min + marker.lon_max) / 2;

            markers[fac_id] = marker;
        }
        this.facMarkers.next(markers);
    }

    printFacSummary(summary: any) {

    }

    plotGroup(group: Group,
              clear: boolean = false) {
        var groupPoly: any = this.makePoly(group);
        this.groupPoly.next(groupPoly);
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

    makePoly(notPoly: any) {
        var poly: Poly = {
            type: '',
            properties: {},
            geometry: {}
        }

        poly.type = 'Feature'
        poly['name'] = notPoly.name
        poly['info'] = notPoly.info
        poly['popupContent'] = notPoly.name
        poly.geometry['type'] = 'Polygon'
        poly.geometry['coordinates'] = [[[notPoly.lon_min, notPoly.lat_min],
                                            [notPoly.lon_max, notPoly.lat_min],
                                            [notPoly.lon_max, notPoly.lat_max],
                                            [notPoly.lon_min, notPoly.lat_max]]]
        return poly
    }

    clearMap() {
        this.clearMapNotify.next(true)
    }

    getMapKey() {
        return this._http.get('/api/map-key')
            .map((result: Response) => result.json())
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