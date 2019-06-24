import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';

@Injectable()
export class LoadingService {
    public loading: string[] = [];
    public update: any = new ReplaySubject(1);

    constructor() {}

    add(name:string) {
        this.loading.push(name);
        this.update.next(name);
    }

    finish(name:string) {
        var new_loading: any[] = [];
        for (var idx in this.loading) {
            if (this.loading[idx] !== name) {
                new_loading.push(this.loading[idx]);
            }
        }
        this.loading = new_loading;
        this.update.next('remove-' + name);
    }
}
