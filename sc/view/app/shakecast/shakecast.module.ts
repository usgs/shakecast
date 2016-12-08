import { NgModule }       from '@angular/core';
import { CommonModule }  from '@angular/common';
import { FormsModule }    from '@angular/forms';
import { HttpModule, JsonpModule } from '@angular/http';

import { ShakeCastComponent }       from './shakecast.component';
import { routing,
        appRoutingProviders } from './shakecast.routing';

import { HeaderComponent } from './header/header.component'
import { NavComponent } from './nav/nav.component'

import { DashboardComponent } from './pages/dashboard/dashboard.component'
import { EarthquakeDashComponent } from './pages/dashboard/earthquake-dash/earthquake-dash.component.ts'
import { FacilityDashComponent } from './pages/dashboard/facility-dash/facility-dash.component.ts'
import { NotificationDashComponent } from './pages/dashboard/notification-dash/notification-dash.component.ts'

import { EarthquakesComponent} from './pages/earthquakes/earthquakes.component'
import { EarthquakeListComponent } from './pages/earthquakes/earthquake-list.component'
import { EarthquakeFilter } from './pages/earthquakes/earthquake-filter/earthquake-filter.component'

import { SharedModule } from '../shared/shared.module'

@NgModule({
  imports: [
    FormsModule,
    CommonModule,
    routing,
    HttpModule,
    JsonpModule,
    SharedModule
  ],
  declarations: [
    ShakeCastComponent,
    HeaderComponent,
    NavComponent,
    DashboardComponent,
    EarthquakeDashComponent,
    FacilityDashComponent,
    NotificationDashComponent,
    EarthquakesComponent,
    EarthquakeListComponent,
    EarthquakeFilter
  ],
  providers: [
  ]
})
export class ShakeCastModule {
}