import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';

@Injectable()
export class TitleService {
    public title = new ReplaySubject(1);
}
