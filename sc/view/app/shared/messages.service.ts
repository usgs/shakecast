import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import 'rxjs/add/operator/map';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { NotificationsService } from 'angular2-notifications';

@Injectable()
export class MessagesService {
    public messages = new ReplaySubject(1);
    constructor(private _http: Http,
                private notService: NotificationsService) {}

    getMessages() {
        this._http.get('/api/messages')
            .map((result: Response) => result.json())
            .subscribe((result: any) => {
                this.messages.next(result);
            });

    }
}
