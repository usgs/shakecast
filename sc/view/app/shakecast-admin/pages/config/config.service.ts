import { Injectable } from '@angular/core';
import { Http, 
         Response, 
         Headers, 
         RequestOptions, 
         URLSearchParams,
         headers } from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { Observable } from 'rxjs/Observable';
import { ReplaySubject } from 'rxjs/ReplaySubject';

@Injectable()
export class ConfigService {
    public loadingData = new ReplaySubject(1);
    public configs = new ReplaySubject(1);

    constructor(private _http: Http) {}

    getConfigs() {
        this.loadingData.next(true)
        this._http.get('/admin/api/configs')
            .map((result: Response) => result.json())
            .subscribe((result: any) => {
                this.configs.next(result);
                this.loadingData.next(false)
            })
    }

    saveConfigs(newConfigs: any) {
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        this._http.post('/admin/api/configs', 
                        JSON.stringify({configs: newConfigs}),
                        {headers}
                    )
              .subscribe((result: any) => {
                  console.log('Success')
              });
    }    
}