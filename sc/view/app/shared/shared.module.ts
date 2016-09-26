import { NgModule }            from '@angular/core';
import { CommonModule }        from '@angular/common';
import { FormsModule }         from '@angular/forms';

// Map service and component
import { AgmCoreModule } from 'angular2-google-maps/core';
import { MapComponent } from './gmaps/map.component';

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
  exports: [MapComponent,
            EarthquakeBlurbComponent,
            CommonModule, 
            FormsModule,
            StickToTopDirective]
})
export class SharedModule { }