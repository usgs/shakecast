import { Injectable } from '@angular/core';
import { HttpClient, HttpParams} from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';

import { Observable ,  ReplaySubject } from 'rxjs';
import { NotificationsService } from 'angular2-notifications';

@Injectable()
export class ConfigService {
    public loadingData = new ReplaySubject(1);
    public configs = new ReplaySubject(1);

    constructor(private http: HttpClient,
                private notService: NotificationsService) {}

    getConfigs() {
        this.loadingData.next(true)
        this.http.get('api/configs')
            .subscribe((result: any) => {
                this.configs.next(result);
                this.loadingData.next(false)
            })
    }

    saveConfigs(newConfigs: any) {
        this.http.post('api/configs',
                        {configs: newConfigs}
        ).subscribe((result: any) => {
            this.notService.success('Success!', 'New Configurations Saved');
        });
    }

    systemTest() {
        this.notService.success('System Test', 'System test starting...');
        this.http.get('api/system-test')
            .subscribe((result: boolean) => {
                if (!result) {
                    this.notService.error('System Test Failed', 'Unable to reach the ShakeCast server')
                }
                this.loadingData.next(false);
            });
    }
}
