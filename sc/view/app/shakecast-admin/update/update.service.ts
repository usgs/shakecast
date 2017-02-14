import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { Http, Response, Headers, RequestOptions, URLSearchParams } from '@angular/http';
import { NotificationsService } from 'angular2-notifications';

@Injectable()
export class UpdateService {
    public info = new ReplaySubject(1)
    constructor(private _http: Http,
                private notService: NotificationsService) {}

    getData() {
        this._http.get('/api/software-update')
            .map((result: Response) => result.json())
            .subscribe((result: any) => {
                this.info.next(result);
            });
    }

    updateShakecast() {
        this._http.post('/api/software-update')
            .map((result: Response) => result.json())
            .subscribe((result: any) => {
                this.info.next(result);
                if (result['required'] == false) {
                    this.notService.success('Software Update', 'Update Complete');
                } else {
                    this.notService.alert('Software Update', 'Update Failed');
                }
            });
    }
}
