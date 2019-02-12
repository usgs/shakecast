import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';

@Injectable()
export class UploadService {
    public show = new ReplaySubject(1);

    showUpload() {
        this.show.next(true);
    }

    hideUpload() {
        this.show.next(false);
    }

    clearQueue() {
    }
}
