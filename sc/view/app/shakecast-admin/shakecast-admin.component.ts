import { Component, 
         ViewEncapsulation,
         HostBinding } from '@angular/core';
import { UploadService } from './upload/upload.service'
import { fadeAnimation }   from '../shared/animations/animations';
@Component({
    selector: 'shakecast-admin',
    templateUrl: 'app/shakecast-admin/shakecast-admin.component.html',
    animations: [ fadeAnimation ]
})
export class ShakeCastAdminComponent {
    @HostBinding('@routeAnimation') routeAnimation = true;
    @HostBinding('style.display')   display = 'block';
    @HostBinding('style.position')  position = 'static';

    constructor(public uploadService: UploadService) {}
    showUpload() {
        this.uploadService.showUpload();
    }
}