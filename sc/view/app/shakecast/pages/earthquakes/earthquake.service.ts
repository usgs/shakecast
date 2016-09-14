import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

export class Earthquake {
    constructor(
        public shakecast_id: string,
        public magnitude: number,
        public depth: number,
        public lat: number,
        public lon: number,
        public description: string
    ) {}
}

@Injectable()
export class EarthquakeService {
    public earthquakeData: Earthquake[] = [];
    public filter = {};

    constructor(private _http: Http) {}

    getData(): Observable<any> {
        return this._http.get('/api/earthquake-data', {filter: this.filter})
            .map((result: Response) => result.json())
    }
}