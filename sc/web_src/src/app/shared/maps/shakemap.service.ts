import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';

import { Earthquake } from '../../shakecast/pages/earthquakes/earthquake.service'

@Injectable()
export class ShakemapService {

    constructor(private _http: HttpClient) {}

    shakemapCheck(eq: Earthquake) : Observable<any> {
        return this._http.get('/api/shakemaps/' + eq.event_id)
    }

    getFacilities(sm: any) {
        return this._http.get('/api/shakemaps/' + sm.shakemap_id + '/facilities')
    }
}
