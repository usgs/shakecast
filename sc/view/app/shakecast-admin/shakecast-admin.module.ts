import { NgModule }       from '@angular/core';
import { BrowserModule }  from '@angular/platform-browser';
import { FormsModule }    from '@angular/forms';
import { HttpModule, JsonpModule } from '@angular/http';

import { ShakeCastAdminComponent }       from './shakecast-admin.component';
import { routing,
        appRoutingProviders } from './shakecast-admin.routing';

import { HeaderComponent } from './header/header.component'
import { NavComponent } from './nav/nav.component'


import { DashboardComponent } from './pages/dashboard/dashboard.component'

import { FacilitiesComponent } from './pages/facilities/facilities.component'
import { FacilityListComponent } from './pages/facilities/facility-list.component'

import { EarthquakesComponent } from './pages/earthquakes/earthquakes.component'
import { EarthquakeListComponent } from './pages/earthquakes/earthquake-list.component'

import { UploadComponent } from './pages/upload/upload.component'

import { SharedModule } from '../shared/shared.module'

@NgModule({
  imports: [
    FormsModule,
    routing,
    HttpModule,
    JsonpModule,
    SharedModule
  ],
  declarations: [
    ShakeCastAdminComponent,
    HeaderComponent,
    NavComponent,
    DashboardComponent,
    FacilitiesComponent,
    FacilityListComponent,
    EarthquakesComponent,
    EarthquakeListComponent,
    UploadComponent
  ],
  providers: [
  ]
})
export class ShakeCastAdminModule {
}


/*
Copyright 2016 Google Inc. All Rights Reserved.
Use of this source code is governed by an MIT-style license that
can be found in the LICENSE file at http://angular.io/license
*/