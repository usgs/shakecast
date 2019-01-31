import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { ReplaySubject } from 'rxjs';
import { NotificationsService } from 'angular2-notifications';

@Injectable()
export class MessagesService {
    public messages = new ReplaySubject(1);
    constructor(private _http: HttpClient,
                private notService: NotificationsService) {}

    getMessages() {
        this._http.get('api/messages')
            .subscribe((result: any) => {
                this.messages.next(result);
            });

    }
}
