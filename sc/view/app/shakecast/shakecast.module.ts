import { NgModule }       from '@angular/core';
import { CommonModule }  from '@angular/common';
import { FormsModule }    from '@angular/forms';
import { HttpModule, JsonpModule } from '@angular/http';

import { ShakeCastComponent }       from './shakecast.component';
import { routing,
        appRoutingProviders } from './shakecast.routing';

import { HeaderComponent } from './header/header.component'
import { NavComponent } from './nav/nav.component'

import { EarthquakesComponent} from './pages/earthquakes/earthquakes.component'
import { DashboardComponent } from './pages/dashboard/dashboard.component'
import { EarthquakeListComponent } from './pages/earthquakes/earthquake-list.component'

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
    EarthquakesComponent,
    EarthquakeListComponent
  ],
  providers: [
  ]
})
export class ShakeCastModule {
}