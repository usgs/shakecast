import { NgModule }            from '@angular/core';
import { CommonModule }        from '@angular/common';
import { FormsModule }         from '@angular/forms';

// Map service and component
import { MapComponent } from './maps/map.component';
import { ShakemapService } from './maps/shakemap.service.ts' 

// Earthquake Blurb
import { EarthquakeBlurbComponent } from './earthquake-blurb/earthquake-blurb.component'
// scroll behavior
import { StickToTopDirective } from './directives/stick-to-top.directive';
// screen dimmer
import { ScreenDimmerComponent } from './screen-dimmer/screen-dimmer.component'

@NgModule({
  imports: [
        CommonModule,
        ],
  declarations: [MapComponent,
                 StickToTopDirective,
                 EarthquakeBlurbComponent,
                 ScreenDimmerComponent],
  providers: [
  ],
  exports: [MapComponent,
            EarthquakeBlurbComponent,
            CommonModule, 
            FormsModule,
            StickToTopDirective,
            ScreenDimmerComponent]
})
export class SharedModule { }