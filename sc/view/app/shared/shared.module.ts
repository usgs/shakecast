import { NgModule }            from '@angular/core';
import { CommonModule }        from '@angular/common';
import { FormsModule }         from '@angular/forms';

// Map service and component
import { AgmCoreModule } from 'angular2-google-maps/core';
import { MapComponent } from './maps/map.component';
import { ShakemapService } from './maps/shakemap.service.ts' 

// Earthquake Blurb
import { EarthquakeBlurbComponent } from './earthquake-blurb/earthquake-blurb.component'
// scroll behavior
import { StickToTopDirective } from './directives/stick-to-top.directive';

@NgModule({
  imports: [
        CommonModule,
        AgmCoreModule.forRoot({
        apiKey: 'AIzaSyBQE3bvBOlyD1td50LJtYmy0WxynUdd4IM'})
        ],
  declarations: [MapComponent,
                 StickToTopDirective,
                 EarthquakeBlurbComponent],
  providers: [
  ],
  exports: [MapComponent,
            EarthquakeBlurbComponent,
            CommonModule, 
            FormsModule,
            StickToTopDirective]
})
export class SharedModule { }