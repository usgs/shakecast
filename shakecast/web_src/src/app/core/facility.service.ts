import { Injectable } from '@angular/core';
import { HttpClient, HttpParams} from '@angular/common/http';


import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { NotificationsService } from 'angular2-notifications';
import { MapService } from '@core/map.service';
import { LoadingService } from '@core/loading.service';

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
    public facilityData = new BehaviorSubject(null);
    public facilityCount = new BehaviorSubject(null);
    public facilityDataUpdate = new BehaviorSubject(null);
    public facilityInfo = new BehaviorSubject(null);
    public facilityShaking = new BehaviorSubject(null);
    public impactSummary = new BehaviorSubject(null);
    public selection = new BehaviorSubject(null);
    public select = new BehaviorSubject(null);
    public selectedFacs: Facility[] = [];
    public filter = {
      limit: 50
    };
    public sub: any = null;

    constructor(private _http: HttpClient,
                private mapService: MapService,
                private notService: NotificationsService,
                private loadingService: LoadingService) {}

    getData(filter: any = {}) {
        if (this.sub) {
            this.sub.unsubscribe();
        }

        // Unselect current facilities
        this.unselectAll();

        this.loadingService.add('Facilities');
        let params_ = new HttpParams();
        params_ = params_.append('filter', JSON.stringify(filter));

        for (const key in filter) {
          if (filter[key]) {
            params_ = params_.append(key, filter[key]);
          }
        }

        this.sub = this._http.get('api/facilities', {params: params_})
            .subscribe((result: any) => {
                this.selectedFacs = [];
                this.facilityData.next(result);
                this.loadingService.finish('Facilities');
            }, (error: any) => {
                this.loadingService.finish('Facilities');
            });
    }

    updateData(filter: any = {}) {
        let params = new HttpParams().set('filter', JSON.stringify(filter))
        this._http.get('api/facility-data', {params: params})
            .subscribe((result: any) => {
                this.facilityDataUpdate.next(result.data);
            });
    }

    getImpactSummary(event_id: string) {
        this.sub = this._http.get('api/shakemaps/' + event_id + '/impact-summary')
            .subscribe((result: any) => {
                this.impactSummary.next(result);

            }, (error: any) => {
                this.impactSummary.next(null);
            });
    }

    getFacilityShaking(facility: any, event: any) {
        /* Get shaking history for a specific event and facility */

        this.loadingService.add('Facilities');
        this._http.get('api/facility-shaking/' + facility['shakecast_id'] + '/' + event['event_id'])
            .subscribe((result: any) => {
                if (result.data) {
                    this.facilityShaking.next(result.data);
                }
                this.loadingService.finish('Facilities')
            }, (error: any) => {
                this.loadingService.finish('Facilities');
            });
    }

    selectAll() {
        this.selection.next('all');
    }

    unselectAll() {
        this.selection.next('none');
    }

    deleteFacs() {
        this.notService.success('Deleting Facilities', 'Deleting ' + this.selectedFacs.length + ' facilities');
        let params = new HttpParams().set('inventory', JSON.stringify(this.selectedFacs));
        params = params.append('inventory_type', 'facility');
        this._http.delete('api/facilities', {params: params})
            .subscribe((result: any) => {
                this.getData();
            });
    }

    removeFac(fac: Facility) {
        this.mapService.removeFac(fac);
    }

    clearMap() {
        this.mapService.clearMap();
    }

}
