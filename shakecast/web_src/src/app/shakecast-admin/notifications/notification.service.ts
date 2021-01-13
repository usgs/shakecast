import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { ReplaySubject, BehaviorSubject } from 'rxjs';
import { NotificationsService } from 'angular2-notifications';

@Injectable()
export class NotificationHTMLService {
    public loadingData = new ReplaySubject(1);
    public notification = new BehaviorSubject(null);
    public config = new ReplaySubject(1);
    public tempNames = new ReplaySubject(1);
    public imageNames = new ReplaySubject(1);
    public name = new ReplaySubject(1);

    constructor(private _http: HttpClient,
                private notService: NotificationsService) {}

    getNotification(name: string,
                    notType: string,
                    config: any = null) {
        this.loadingData.next(true);
        const params = new HttpParams().set('config', JSON.stringify(config));
        this._http.get('api/notification-html/' + notType + '/' + name, {params: params, responseType: 'text'})
            .subscribe((result: any) => {
                this.name.next(name);
                this.notification.next(result);
                this.loadingData.next(false);
            });
    }

    getConfigs(notType: string,
                name: string) {
        this.loadingData.next(true);
        this._http.get('api/notification-config/' + notType + '/' + name)
            .subscribe((result: any) => {
                this.config.next(result);
                this.loadingData.next(false);
            });
    }

    getTemplateNames() {
        this.loadingData.next(true);
        this._http.get('api/template-names')
            .subscribe((result: any) => {
                this.tempNames.next(result);
                this.loadingData.next(false);
            });
    }

    newTemplate(name: string) {
        this._http.get('api/new-template/' + name)
            .subscribe((result: any) => {
                if (result === true) {
                    this.notService.success('Template Created', 'Created ' + name + ' template');
                    this.getNotification(name, 'new_event');
                    this.getConfigs('new_event', name);
                } else {
                    this.notService.success('Template Creation Failed', 'Check application permissions');
                }
            });
    }

    saveConfigs(name: string,
                config: any) {
        this._http.post('api/notification-config/' + config.type + '/' + name,
                            {config: config}
        ).subscribe((result: any) => {
            this.notService.success('Success!', 'New Configurations Saved');
        });
    }

    getImageNames() {
        this._http.get('api/images/')
            .subscribe((result: any) => {
                this.imageNames.next(result);
            });
    }

}
