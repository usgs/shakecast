import { NgModule }            from '@angular/core';
import { CommonModule }        from '@angular/common';
import { FormsModule }         from '@angular/forms';

// Map service and component
import { MapComponent } from './maps/map.component';
import { ShakemapService } from './maps/shakemap.service.ts' 

// Facility List
import { FacilityListComponent } from '../shakecast-admin/pages/facilities/facility-list.component'

// Earthquake Blurb
import { EarthquakeBlurbComponent } from './earthquake-blurb/earthquake-blurb.component'

// dropzone
import { DropzoneComponent } from './dropzone/dropzone.component'

// ng2-file-upload
import { FileSelectDirective, FileDropDirective } from 'ng2-file-upload';

// scroll behavior
import { StickToTopDirective } from './directives/stick-to-top.directive';
// screen dimmer
import { ScreenDimmerComponent } from './screen-dimmer/screen-dimmer.component'

// upload
import { UploadComponent } from './upload/upload.component'

@NgModule({
  imports: [
        CommonModule,
        ],
  declarations: [MapComponent,
                 StickToTopDirective,
                 EarthquakeBlurbComponent,
                 ScreenDimmerComponent,
                 FacilityListComponent,
                 DropzoneComponent,
                 FileSelectDirective,
                 FileDropDirective],
  providers: [
  ],
  exports: [MapComponent,
            EarthquakeBlurbComponent,
            FacilityListComponent,
            CommonModule, 
            FormsModule,
            StickToTopDirective,
            ScreenDimmerComponent,
            DropzoneComponent,
            FileSelectDirective,
            FileDropDirective]
})
export class SharedModule { }