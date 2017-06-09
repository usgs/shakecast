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
    public userGroupData = new ReplaySubject(1);
    public selection = new ReplaySubject(1);
    public dataList: any = [];
    public current_group: Group = null;
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
                if (filter['user']) {
                    this.userGroupData.next(result)
                } else {
                    this.groupData.next(result);
                }
                this.dataList = result;
                this.current_group = result[0];
                this.loadingData.next(false);

                if (this.dataList.length > 0) {
                    for (var group in this.dataList) {
                        // this.mapService.plotGroup(this.dataList[group])
                    }
                }
            })
    }
    
    selectAll() {
        this.selection.next('all');
    }

    unselectAll() {
        this.selection.next('none');
    }

    deleteGroups(group: Group[]) {
        this.loadingData.next(true)
        let params = new URLSearchParams();
        params.set('inventory', JSON.stringify(group))
        params.set('inventory_type', 'group')
        this._http.delete('/api/delete/inventory', {search: params})
            .map((result: Response) => result.json())
            .subscribe((result: any) => {
                this.getData();
                this.loadingData.next(false)
            })
    }

    plotGroup(group: Group) {
        this.mapService.plotGroup(group);
    }

    clearMap() {
        this.mapService.clearMap();
    }
    
}