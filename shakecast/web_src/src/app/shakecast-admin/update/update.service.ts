import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { Response } from '@angular/http';
import { HttpClient } from '@angular/common/http';
import { NotificationsService } from 'angular2-notifications';
import { map } from 'rxjs/operators';

@Injectable()
export class UpdateService {
    public info = new ReplaySubject(1);
    constructor(private _http: HttpClient,
                private notService: NotificationsService) {}

    getData() {
        // This function is out of date with ShakeCast update practices
        /*
        this._http.get('api/software-update')
            .subscribe((result: any) => {
                this.info.next(result);
            });
            */
    }

    updateShakecast() {
        this._http.post('api/software-update', {})
            .pipe(
                map((result: Response) => result.json())
            )
            .subscribe((result: any) => {
                this.info.next(result);
                if (result['required'] === false) {
                    this.notService.success('Software Update', 'Update Complete');
                } else {
                    this.notService.alert('Software Update', 'Update Failed');
                }
            });
    }
}
