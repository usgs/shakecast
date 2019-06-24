import { Component } from '@angular/core';

import { UploadService } from './upload/upload.service';
import { fadeAnimation }  from '@shared/animations/animations';

@Component({
    selector: 'shakecast-admin',
    templateUrl: './shakecast-admin.component.html',
    animations: [ fadeAnimation ]
})
export class ShakeCastAdminComponent {
    constructor(public uploadService: UploadService) {}
    showUpload() {
        this.uploadService.showUpload();
    }
}
