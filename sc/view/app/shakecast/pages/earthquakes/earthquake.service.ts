import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions, URLSearchParams } from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { Observable } from 'rxjs/Observable';
import { ReplaySubject } from 'rxjs/ReplaySubject';

import { MapService } from '../../../shared/maps/map.service'

export interface Earthquake {
    shakecast_id: string;
    event_id: string;
    magnitude: number;
    depth: number;
    lat: number;
    lon: number;
    description: string;
}

@Injectable()
export class EarthquakeService {
    public earthquakeData = new ReplaySubject(1);
    public filter = {};

    constructor(private _http: Http,
                private mapService: MapService) {}

    getData(filter: any = {}) {
        let params = new URLSearchParams();
        params.set('filter', JSON.stringify(filter))
        this._http.get('/api/earthquake-data', {search: params})
            .map((result: Response) => result.json())
            .subscribe((result: any) => {
                this.earthquakeData.next(result.data);
            })
    }
    
    plotEq(eq: Earthquake) {
        this.mapService.plotEq(eq)
    }
}