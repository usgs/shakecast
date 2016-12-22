import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions, URLSearchParams } from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { Observable } from 'rxjs/Observable';
import { ReplaySubject } from 'rxjs/ReplaySubject';

import { MapService } from '../../../shared/maps/map.service'

export interface Facility {
    shakecast_id: string;
    facility_id: string;
    lat: number;
    lon: number;
    name: string;
    description: string;
    selected?:boolean
}

@Injectable()
export class FacilityService {
    public loadingData = new ReplaySubject(1);
    public facilityData = new ReplaySubject(1);
    public shakingData = new ReplaySubject(1);
    public selectedFacs: Facility[] = [];
    public selection = new ReplaySubject(1);
    public filter = {};

    constructor(private _http: Http,
                private mapService: MapService) {}

    getData(filter: any = {}) {
        this.loadingData.next(true)
        let params = new URLSearchParams();
        params.set('filter', JSON.stringify(filter))
        this._http.get('/api/facility-data', {search: params})
            .map((result: Response) => result.json())
            .subscribe((result: any) => {
                this.facilityData.next(result.data);
                this.loadingData.next(false)
            })
    }

    getShakeMapData(event: any) {
        this.loadingData.next(true)
        this._http.get('/api/shakemaps/' + event.event_id + '/facilities')
            .map((result: Response) => result.json())
            .subscribe((result: any) => {
                this.facilityData.next(result.facilities);
                this.shakingData.next(result.shaking);

                this.unselectAll()
                this.loadingData.next(false)
            })
    }
    
    selectAll() {
        this.selection.next('all');
    }

    unselectAll() {
        this.selection.next('none');
    }

    deleteFacs() {
        this.loadingData.next(true)
        let params = new URLSearchParams();
        params.set('facilities', JSON.stringify(this.selectedFacs))
        this._http.delete('/api/delete/facilities', {search: params})
            .map((result: Response) => result.json())
            .subscribe((result: any) => {
                this.getData();
                this.loadingData.next(false)
            })
    }

    plotFac(fac: Facility) {
        this.mapService.plotFac(fac);
    }

    removeFac(fac: Facility) {
        this.mapService.removeFac(fac);
    }

    clearMap() {
        this.mapService.clearMap();
    }
    
}