import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs/ReplaySubject';

@Injectable()
export class TitleService {
    public title = new ReplaySubject(1)
}
