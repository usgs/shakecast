import { Component, ViewEncapsulation } from '@angular/core';
import { UploadService } from './upload/upload.service'

@Component({
  selector: 'shakecast-admin',
  templateUrl: 'app/shakecast-admin/shakecast-admin.component.html'
})
export class ShakeCastAdminComponent {
  constructor(public uploadService: UploadService) {}
  showUpload() {
    this.uploadService.showUpload();
  }
}