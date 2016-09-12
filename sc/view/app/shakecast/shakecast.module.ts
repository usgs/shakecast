import { NgModule }       from '@angular/core';
import { BrowserModule }  from '@angular/platform-browser';
import { FormsModule }    from '@angular/forms';
import { HttpModule, JsonpModule } from '@angular/http';

import { ShakeCastComponent }       from './shakecast.component';
import { routing,
        appRoutingProviders } from './shakecast.routing';

import { HeaderComponent } from './header/header.component'
import { NavComponent } from './nav/nav.component'

import { DashboardComponent } from './pages/dashboard/dashboard.component'
import { EarthquakesComponent } from './pages/earthquakes/earthquakes.component'
import { EarthquakeListComponent } from './pages/earthquakes/earthquake-list.component'

@NgModule({
  imports: [
    FormsModule,
    routing,
    HttpModule,
    JsonpModule
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


/*
Copyright 2016 Google Inc. All Rights Reserved.
Use of this source code is governed by an MIT-style license that
can be found in the LICENSE file at http://angular.io/license
*/