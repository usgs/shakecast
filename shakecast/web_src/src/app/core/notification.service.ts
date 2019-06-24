import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { ReplaySubject } from 'rxjs';

export interface Notification {
    event_id: string;
}

@Injectable()
export class NotificationService {
    public notifications = new ReplaySubject(1);

    constructor(private _http: HttpClient) {}

    getNotifications(eq: any) {
        if (eq) {
            this._http.get('api/notifications/' + eq.event_id + '/')
                .subscribe((result: any) => {
                    this.notifications.next(result);
                });
        }
    }
}
