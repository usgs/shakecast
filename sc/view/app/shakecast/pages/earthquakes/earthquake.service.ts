import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { Observable } from 'rxjs/Observable';

import { MapService } from '../../../shared/gmaps/map.service'

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
    public earthquakeData: Earthquake[] = [];
    public filter = {};

    constructor(private _http: Http,
                private mapService: MapService) {}

    getData(): Observable<any> {
        return this._http.get('/api/earthquake-data', {filter: this.filter})
            .map((result: Response) => result.json())
    }
    
    plotEq(eq: Earthquake) {
        this.mapService.plotEq(eq)
    }
}