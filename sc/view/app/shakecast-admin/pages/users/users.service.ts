import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions, URLSearchParams } from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { Observable } from 'rxjs/Observable';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { NotificationsService } from 'angular2-notifications'
import { MapService } from '../../../shared/maps/map.service'

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

    constructor(private _http: Http,
                private mapService: MapService,
                private notService: NotificationsService) {}

    getData(filter: any = {}) {
        this.loadingData.next(true)
        let params = new URLSearchParams();
        params.set('filter', JSON.stringify(filter))
        this._http.get('/api/users', {search: params})
            .map((result: Response) => result.json())
            .subscribe((result: any) => {
                this.userData.next(result);
                this.current_user = result[0];
                this.loadingData.next(false)
            })
    }

    getCurrentUser() {
        this._http.get('/api/users/current')
            .map((result: Response) => result.json())
            .subscribe((result: any) => {
                this.userData.next([result]);
                this.loadingData.next(false)
            })
    }
    
    selectAll() {
        this.selection.next('all');
    }

    unselectAll() {
        this.selection.next('none');
    }

    saveUsers(users: User[]) {
        let headers = new Headers();
        this.notService.success('User Info', 'Saving your changes...');
        headers.append('Content-Type', 'application/json');
        this._http.post('/api/users', 
                        JSON.stringify({users: users}),
                        {headers}
        )
            .map((result: Response) => result.json())
            .subscribe((result: any) => {
                //this.getData();
                this.loadingData.next(false);
            });
    }

    deleteUsers(users: User[]) {
        this.notService.success('Delete User', 'Deleting ' + users.length + ' user')
        this.loadingData.next(true)
        let params = new URLSearchParams();
        params.set('inventory', JSON.stringify(users))
        params.set('inventory_type', 'user')
        this._http.delete('/api/delete/inventory', {search: params})
            .map((result: Response) => result.json())
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