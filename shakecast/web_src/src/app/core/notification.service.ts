import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

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
          const params_ = new HttpParams().append('event_id', eq.properties.event_id);
          this._http.get('api/notifications', {params: params_})
              .subscribe((result: any) => {
                  this.notifications.next(result);
              });
        }
    }
}
