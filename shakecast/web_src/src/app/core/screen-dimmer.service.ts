import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';

@Injectable()
export class ScreenDimmerService {
    public dim = new ReplaySubject(1)
    
    dimScreen() {
        this.dim.next(true)
    }

    undimScreen() {
        this.dim.next(false)
    }
}
