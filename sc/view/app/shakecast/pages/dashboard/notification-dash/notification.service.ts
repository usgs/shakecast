import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions, URLSearchParams } from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { Observable } from 'rxjs/Observable';
import { ReplaySubject } from 'rxjs/ReplaySubject';

export interface Notification {
    event_id: string;
}

@Injectable()
export class NotificationService {
    public notifications = new ReplaySubject(1);

    constructor(private _http: Http) {}

    getNotifications(eq: any) {
        if (eq) {
            let params = new URLSearchParams();
            this._http.get('/api/notifications/' + eq.event_id + '/')
                .map((result: Response) => result.json())
                .subscribe((result: any) => {
                    this.notifications.next(result);
                });
        }
    }
}