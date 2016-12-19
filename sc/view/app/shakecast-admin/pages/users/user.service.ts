import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions, URLSearchParams } from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { Observable } from 'rxjs/Observable';
import { ReplaySubject } from 'rxjs/ReplaySubject';

import { MapService } from '../../../shared/maps/map.service'

export interface User {
    name: string;
    email?: string;
}

@Injectable()
export class UserService {
    public loadingData = new ReplaySubject(1);
    public userData = new ReplaySubject(1);
    public selection = new ReplaySubject(1);
    public filter = {};

    constructor(private _http: Http,
                private mapService: MapService) {}

    getData(filter: any = {}) {
        this.loadingData.next(true)
        let params = new URLSearchParams();
        params.set('filter', JSON.stringify(filter))
        this._http.get('/api/users', {search: params})
            .map((result: Response) => result.json())
            .subscribe((result: any) => {
                this.userData.next(result.data);
                this.loadingData.next(false)
            })
    }
    
    selectAll() {
        this.selection.next('all');
    }

    unselectAll() {
        this.selection.next('none');
    }

    deleteGroups() {
        /*
        this.loadingData.next(true)
        let params = new URLSearchParams();
        params.set('facilities', JSON.stringify(this.selectedFacs))
        this._http.delete('/api/delete/facilities', {search: params})
            .map((result: Response) => result.json())
            .subscribe((result: any) => {
                this.getData();
                this.loadingData.next(false)
            })
            */
    }

    plotFac(fac: Facility) {
        /*
        this.mapService.plotFac(fac);
        */
    }

    removeFac(fac: Facility) {
        /*
        this.mapService.removeFac(fac);
        */
    }
    
}