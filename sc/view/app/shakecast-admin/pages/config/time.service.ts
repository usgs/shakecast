import { Injectable } from '@angular/core';
import { Http, 
         Response, 
         Headers, 
         RequestOptions, 
         URLSearchParams,
         headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { ReplaySubject } from 'rxjs/ReplaySubject';

@Injectable()
export class TimeService {
    constructor() {}
    toUTCDate(date: Date) {
        var _utc = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(),  date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
        return _utc;
    };

    getUTCTime() {
        var date = new Date()
        var _utc = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(),  date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
        return _utc;
    };

    getOffsetTime(hourOffset: number) {
        var date = new Date()
        var _utc = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(),  date.getUTCHours() + hourOffset, date.getUTCMinutes(), date.getUTCSeconds());
        return _utc;
    }

}  
