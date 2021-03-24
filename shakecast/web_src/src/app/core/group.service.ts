import { Injectable } from '@angular/core';
import { HttpClient, HttpParams} from '@angular/common/http';

import { ReplaySubject } from 'rxjs';

import { MapService } from '@core/map.service'

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
    public groupSummary = new ReplaySubject(1);
    public groupUsers = new ReplaySubject(1);
    public groupFacilities = new ReplaySubject(1);
    public selection = new ReplaySubject(1);
    public dataList: any = [];
    public current_group: Group = null;
    public filter = {};

    constructor(private http: HttpClient,
                private mapService: MapService) {}

    getData(filter: any = {}) {
        this.loadingData.next(true);
        let params = new HttpParams();
        params = params.set('filter', JSON.stringify(filter));
        this.http.get('api/groups', { params })
            .subscribe((result: any) => {
                this.groupData.next(result);
                this.dataList = result;
                this.current_group = result[0];
                this.loadingData.next(false);
            });
    }

    getUsers(groupId) {
      this.http.get(`/api/groups/${groupId}/users`).subscribe(users => {
          this.groupUsers.next(users);
        }
      );
    }

    getFacilities(groupId) {
      this.http.get(`/api/groups/${groupId}/facilities`).subscribe(facilities => {
          this.groupFacilities.next(facilities);
        }
      );
    }

    selectAll() {
        this.selection.next('all');
    }

    unselectAll() {
        this.selection.next('none');
    }

    deleteGroups(group: Group[]) {
        this.loadingData.next(true);
        let params = new HttpParams();
        params = params.append('inventory', JSON.stringify(group));
        params = params.append('inventory_type', 'group');
        this.http.delete('api/groups', { params })
            .subscribe((result: any) => {
                this.getData();
                this.loadingData.next(false);
            });
    }

    plotGroup(group: Group) {
        this.mapService.plotGroup(group);
    }

    clearMap() {
        this.mapService.clearMap();
    }

}
