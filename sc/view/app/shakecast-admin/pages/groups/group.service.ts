import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions, URLSearchParams } from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { Observable } from 'rxjs/Observable';
import { ReplaySubject } from 'rxjs/ReplaySubject';

import { MapService } from '../../../shared/maps/map.service'

export interface Group {
    lat_min: number;
    lon_min: number;
    lat_max: number;
    lon_max: number;
    name: string;
}

@Injectable()
export class GroupService {
    public loadingData = new ReplaySubject(1);
    public groupData = new ReplaySubject(1);
    public selection = new ReplaySubject(1);
    public filter = {};

    constructor(private _http: Http,
                private mapService: MapService) {}

    getData(filter: any = {}) {
        this.loadingData.next(true)
        let params = new URLSearchParams();
        params.set('filter', JSON.stringify(filter))
        this._http.get('/api/groups', {search: params})
            .map((result: Response) => result.json())
            .subscribe((result: any) => {
                this.groupData.next(result);
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

    plotGroup(group: Group) {
        this.mapService.plotGroup(group);
    }

    removeFac(fac: Facility) {
        /*
        this.mapService.removeFac(fac);
        */
    }

    clearMap() {
        this.mapService.clearMap();
    }
    
}