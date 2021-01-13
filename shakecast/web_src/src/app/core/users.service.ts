import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders} from '@angular/common/http';


import { ReplaySubject } from 'rxjs';
import { NotificationsService } from 'angular2-notifications';
import { MapService } from '@core/map.service';

export interface User {
    name: string;
    email?: string;
}

@Injectable()
export class UsersService {
    public loadingData = new ReplaySubject(1);
    public userData = new ReplaySubject(1);
    public selection = new ReplaySubject(1);
    public saveUsersFromList = new ReplaySubject(1);
    public current_user: any = null;
    public filter = {};

    constructor(private _http: HttpClient,
                private mapService: MapService,
                private notService: NotificationsService) {}

    getData(filter: any = {}) {
        this.loadingData.next(true);
        const params = new HttpParams().set('filter', JSON.stringify(filter));
        this._http.get('api/users', {params: params})
            .subscribe((result: any) => {
                this.userData.next(result);
                this.current_user = result[0];
                this.loadingData.next(false);
            });
    }

    getCurrentUser() {
        this._http.get('api/users/current')
            .subscribe((result: any) => {
                this.userData.next([result]);
                this.loadingData.next(false);
            });
    }

    selectAll() {
        this.selection.next('all');
    }

    unselectAll() {
        this.selection.next('none');
    }

    saveUsers(users: User[]) {
        const httpOptions = {
          headers: new HttpHeaders({
            'Content-Type':  'application/json',
            'Authorization': 'my-auth-token'
          })
        };
        this.notService.success('User Info', 'Saving your changes...');
        this._http.post('api/users',
                        {users: users},
                        httpOptions
        )
            .subscribe((result: any) => {
                this.loadingData.next(false);
            });
    }

    deleteUsers(users: User[]) {
        this.notService.success('Delete User', 'Deleting ' + users.length + ' user')
        this.loadingData.next(true);
        let params = new HttpParams().set('inventory', JSON.stringify(users));
        params = params.append('inventory_type', 'user');
        this._http.delete('api/inventory/delete', {params: params})
            .subscribe((result: any) => {
                this.getData();
                this.loadingData.next(false);
            });
    }

    plotUser(user: any) {
        this.mapService.plotUser(user);
    }

    clearMap() {
        this.mapService.clearMap();
    }
}
