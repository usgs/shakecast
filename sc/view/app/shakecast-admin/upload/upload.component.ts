import { Component,
         OnInit,
         OnDestroy,         
         trigger,
         state,
         style,
         transition,
         animate } from '@angular/core';
import {FileUploader} from 'ng2-file-upload';

import { UploadService } from './upload.service'
import { ScreenDimmerService } from '../../shared/screen-dimmer/screen-dimmer.service'

@Component({
    selector: 'upload',
    templateUrl: 'app/shakecast-admin/upload/upload.component.html',
    styleUrls: ['app/shakecast-admin/upload/upload.component.css'],  
    animations: [
      trigger('showUpload', [
        state('false', style({top: '-600px'})),
        state('true', style({top: '100px'})),
          transition('true => false', animate('100ms ease-out')),
          transition('false => true', animate('100ms ease-in'))
      ])
    ]
})
export class UploadComponent implements OnInit, OnDestroy{
    public uploader:FileUploader = new FileUploader({url: '/admin/upload/'});
    public hasBaseDropZoneOver:boolean = false;
    public hasAnotherDropZoneOver:boolean = false;
    public show: boolean = false
    private subscriptions: any = []

    constructor(private uploadService: UploadService,
                private screenDimmer: ScreenDimmerService) {}
    ngOnInit() {
        this.subscriptions.push(this.uploadService.show.subscribe(show => {
            if (show === true) {
                this.showUpload();
            } else {
                this.hideUpload();
            }
        }));
    }

    showUpload() {
        this.show = true
        this.screenDimmer.dimScreen();
    }

    hideUpload() {
        this.show = false
        this.screenDimmer.undimScreen();
    }

    uploadAll(e:any) {
        e.preventDefault();
        this.uploader.uploadAll();
        this.uploader.clearQueue();
    }

    public fileOverBase(e:any):void {
        this.hasBaseDropZoneOver = e;
    }

    public fileOverAnother(e:any):void {
        this.hasAnotherDropZoneOver = e;
    }

    ngOnDestroy() {
        this.endSubscriptions()
    }

    endSubscriptions() {
        for (var sub in this.subscriptions) {
            this.subscriptions[sub].unsubscribe()
        }
    }
}