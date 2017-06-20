import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions, URLSearchParams } from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { Observable } from 'rxjs/Observable';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { NotificationsService } from 'angular2-notifications'

@Injectable()
export class NotificationHTMLService {
    public loadingData = new ReplaySubject(1);
    public notification = new ReplaySubject(1);
    public config = new ReplaySubject(1);
    public tempNames = new ReplaySubject(1);
    public imageNames = new ReplaySubject(1);
    public name = new ReplaySubject(1);

    constructor(private _http: Http,
                private notService: NotificationsService) {}

    getNotification(name: string,
                    notType: string,
                    config: any = null) {
        this.loadingData.next(true)
        let params = new URLSearchParams();
        params.set('config', JSON.stringify(config));
        this._http.get('/api/notification-html/' + notType + '/' + name,
                        {search: params})
            .subscribe((result: Response) => {
                this.name.next(name)
                this.notification.next(result._body);
                this.loadingData.next(false)
            });
    }

    getConfigs(notType: string,
                name: string) {
        this.loadingData.next(true)
        this._http.get('/api/notification-config/' + notType + '/' + name)
            .map((result: Response) => result.json())
            .subscribe((result: any) => {
                this.config.next(result);
                this.loadingData.next(false)
            });
    }

    getTemplateNames() {
        this.loadingData.next(true)
        this._http.get('/api/template-names')
            .map((result: Response) => result.json())
            .subscribe((result: any) => {
                this.tempNames.next(result);
                this.loadingData.next(false)
            });
    }

    newTemplate(name: string) {
        this._http.get('/admin/new-template/' + name)
            .map((result: Response) => result.json())
            .subscribe((result: any) => {
                if (result === true) {
                    this.notService.success('Template Created', 'Created ' + name + ' template')
                    this.getNotification(name, 'new_event');
                    this.getConfigs('new_event', name);
                } else {
                    this.notService.success('Template Creation Failed', 'Check application permissions')
                }
            });
    }

    saveConfigs(name: string,
                config: any) {
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        this._http.post('/api/notification-config/' + config.type + '/' + name, 
                        JSON.stringify({config: config}),
                        {headers}
        ).subscribe((result: any) => {
            this.notService.success('Success!', 'New Configurations Saved');
        });
    }

    getImageNames() {
        this._http.get('/api/images/')
            .map((result: Response) => result.json())
            .subscribe((result: any) => {
                this.imageNames.next(result)
            });
                
    }

}