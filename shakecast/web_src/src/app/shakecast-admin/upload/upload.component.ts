import { Component,
         OnInit,
         OnDestroy } from '@angular/core';
import { trigger,
         state,
         style,
         transition,
         animate } from '@angular/animations';

import { FileUploader } from 'ng2-file-upload';

import { NotificationsService } from 'angular2-notifications';
import { UploadService } from './upload.service';
import { ScreenDimmerService } from '@core/screen-dimmer.service';

@Component({
    selector: 'upload',
    templateUrl: './upload.component.html',
    styleUrls: ['./upload.component.css'],
    animations: [
      trigger('showUpload', [
        state('no', style({top: '-800px'})),
        state('yes', style({top: '60px'})),
          transition('* => *', animate('100ms ease-out'))
      ])
    ]
})
export class UploadComponent implements OnInit, OnDestroy {
    public uploader: FileUploader = new FileUploader({url: 'api/upload/'});
    public hasBaseDropZoneOver = false;
    public hasAnotherDropZoneOver = false;
    public show = 'no';
    private subscriptions: any = [];

    constructor(private uploadService: UploadService,
                private screenDimmer: ScreenDimmerService,
                private notService: NotificationsService) {}
    ngOnInit() {
        this.subscriptions.push(this.uploadService.show.subscribe(show => {
            if (show === true) {
                this.showUpload();
            } else {
                this.hideUpload();
            }
        }));

        this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
            if (status === 200) {
                this.notService.success('File Upload', 'Success!');
            } else {
                this.notService.error('File Upload', 'Error');
            }
        };
    }

    showUpload() {
        this.show = 'yes';
        this.screenDimmer.dimScreen();
    }

    hideUpload() {
        this.show = 'no';
        this.screenDimmer.undimScreen();
    }

    uploadAll(e:any) {
        e.preventDefault();
        this.uploader.uploadAll();
        this.uploader.clearQueue();
    }

    upload(item: any) {
        this.notService.success('File Upload', 'Starting...');
        item.upload();
    }

    public fileOverBase(e:any):void {
        this.hasBaseDropZoneOver = e;
    }

    public fileOverAnother(e:any):void {
        this.hasAnotherDropZoneOver = e;
    }

    ngOnDestroy() {
        this.endSubscriptions();
    }

    endSubscriptions() {
        for (const sub of this.subscriptions) {
            sub.unsubscribe();
        }
    }
}
