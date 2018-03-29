import { NgModule }            from '@angular/core';
import { CommonModule }        from '@angular/common';
import { FormsModule }         from '@angular/forms';

// Map service and component
import { MapComponent } from './maps/map.component';

// Facility List
import { FacilityListComponent } from '../shakecast-admin/pages/facilities/facility-list.component';
import { FacilityInfoComponent } from '../shakecast-admin/pages/facilities/facility-info/facility-info.component';

// Earthquake List
import { EarthquakeListComponent } from '../shakecast/pages/earthquakes/earthquake-list.component';

// Earthquake Blurb
import { EarthquakeBlurbComponent } from './earthquake-blurb/earthquake-blurb.component';

// scroll behavior
import { StickToTopDirective } from './directives/stick-to-top.directive';

import { ScrollToggleDirective } from './directives/scroll-toggle.directive';
// screen dimmer
import { ScreenDimmerComponent } from './screen-dimmer/screen-dimmer.component';

// in-app documentation
import { InfoComponent } from './info/info.component';
import { FacilityCountComponent } from './maps/facility-count/facility-count.component';
import { ImpactComponent } from './maps/impact/impact.component';
import { LayerService } from './maps/layers/layer.service';

import { PanelsModule } from './panels/panels.module'

@NgModule({
  imports: [
        CommonModule,
        PanelsModule,
        ],
  declarations: [MapComponent,
                 StickToTopDirective,
                 ScrollToggleDirective,
                 EarthquakeBlurbComponent,
                 ScreenDimmerComponent,
                 EarthquakeListComponent,
                 FacilityListComponent,
                 FacilityInfoComponent,
                 InfoComponent,
                 FacilityCountComponent,
                 ImpactComponent],
  providers: [
  LayerService],
  exports: [MapComponent,
            EarthquakeBlurbComponent,
            FacilityListComponent,
            FacilityInfoComponent,
            EarthquakeListComponent,
            CommonModule, 
            FormsModule,
            StickToTopDirective,
            ScrollToggleDirective,
            ScreenDimmerComponent,
            InfoComponent,
            PanelsModule]
})
export class SharedModule { }