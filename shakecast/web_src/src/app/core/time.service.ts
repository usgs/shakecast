import { Injectable } from '@angular/core';
import { Observable ,  ReplaySubject } from 'rxjs';

@Injectable()
export class TimeService {
    constructor() {}
    toUTCDate(date: Date) {
        const _utc = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(),
                date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
        return _utc;
    }

    getUTCTime() {
        const date = new Date()
        const _utc = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(),
                date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
        return _utc;
    }

    getOffsetTime(hourOffset: number) {
        const date = new Date();
        const _utc = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(),
                date.getUTCHours() + hourOffset, date.getUTCMinutes(), date.getUTCSeconds());
        return _utc;
    }

}
