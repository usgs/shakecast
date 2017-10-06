import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions, URLSearchParams } from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { Observable } from 'rxjs/Observable';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { Router } from '@angular/router';
import { NotificationsService } from 'angular2-notifications';
import { MapService } from '../../../shared/maps/map.service';
import { LoadingService } from '../../../loading/loading.service';

export interface Facility {
    shakecast_id?: string;
    facility_id?: string;
    lat?: number;
    lon?: number;
    name?: string;
    description?: string;
    shakemap?: string;
    selected?: string;
}

@Injectable()
export class FacilityService {
    public loadingData = new ReplaySubject(1);
    public facilityData = new ReplaySubject(1);
    public facilityDataUpdate = new ReplaySubject(1);
    public facilityInfo = new ReplaySubject(1);
    public facilityShaking = new ReplaySubject(1);
    public showInfo = new ReplaySubject(1);
    public shakingData = new ReplaySubject(1);
    public selectedFacs: Facility[] = [];
    public selection = new ReplaySubject(1);
    public filter = {};
    public sub: any = null;

    constructor(private _http: Http,
                private mapService: MapService,
                private _router: Router,
                private notService: NotificationsService,
                private loadingService: LoadingService) {}

    getData(filter: any = {}) {
        this.loadingService.add('Facilities');
        if (this.sub) {
            this.sub.unsubscribe();
        }
        let params = new URLSearchParams();
        params.set('filter', JSON.stringify(filter))
        this.sub = this._http.get('/api/facility-data', {search: params})
            .map((result: Response) => result.json())
            .subscribe((result: any) => {
                this.selectedFacs = [];
                this.shakingData.next(null);
                this.facilityData.next(result.data);
                this.loadingService.finish('Facilities');
            })
    }

    updateData(filter: any = {}) {
        let params = new URLSearchParams();
        params.set('filter', JSON.stringify(filter))
        this._http.get('/api/facility-data', {search: params})
            .map((result: Response) => result.json())
            .subscribe((result: any) => {
                this.facilityDataUpdate.next(result.data);
            })
    }

    getShakeMapData(event: any) {
        /* get list of facilities affected by a specific event */
        this.loadingService.add('Facilities');
        if (this.sub) {
            this.sub.unsubscribe();
        }
        this.sub = this._http.get('/api/shakemaps/' + event.event_id + '/facilities')
            .map((result: Response) => result.json())
            .subscribe((result: any) => {

                if (this._router.url == '/shakecast/dashboard') {
                    this.facilityData.next(result.facilities);
                }

                this.shakingData.next(result.alert);
                //this.unselectAll();

                if (result.facilities.length > 0) {
                    this.mapService.plotFacs(result.facilities);
                }
                
                this.loadingService.finish('Facilities');
            })
    }

    getFacilityShaking(facility: any, event: any) {
        /* Get shaking history for a specific event and facility */

        this.loadingService.add('Facilities');
        this._http.get('/api/facility-shaking/' + facility['shakecast_id'] + '/' + event['event_id'])
            .map((result: Response) => result.json())
            .subscribe((result: any) => {
                if (result.data) {
                    this.facilityShaking.next(result.data);
                }
                this.loadingService.finish('Facilities')
            })
    }

    setFacInfo(fac: Facility) {
        this.showInfo.next(fac);
    }

    hideFacInfo() {
        this.showInfo.next(null);
    }
    
    selectAll() {
        this.selection.next('all');
    }

    unselectAll() {
        this.selection.next('none');
    }

    deleteFacs() {
        this.notService.success('Deleting Facilities', 'Deleting ' + this.selectedFacs.length + ' facilities')
        this.loadingData.next(true)
        let params = new URLSearchParams();
        params.set('inventory', JSON.stringify(this.selectedFacs))
        params.set('inventory_type', 'facility')
        this._http.delete('/api/delete/inventory', {search: params})
            .map((result: Response) => result.json())
            .subscribe((result: any) => {
                this.getData();
                this.loadingData.next(false)
            })
    }

    plotFac(fac: Facility) {
        this.facilityInfo.next(fac);
        this.mapService.plotFac(fac);
    }

    removeFac(fac: Facility) {
        this.mapService.removeFac(fac);
    }

    clearMap() {
        this.mapService.clearMap();
    }
    
}