import { NgModule }       from '@angular/core';
import { BrowserModule }  from '@angular/platform-browser';
import { FormsModule }    from '@angular/forms';

import { AppComponent }       from './app.component';
import { routing,
        appRoutingProviders } from './app.routing';

import { HeaderComponent } from './header/header.component'
import { NavComponent } from './nav/nav.component'

import { DashboardModule } from './pages/dashboard/dashboard.module'
import { EarthquakesModule } from './pages/earthquakes/earthquakes.module'

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    routing,
    EarthquakesModule,
    DashboardModule
  ],
  declarations: [
    AppComponent,
    HeaderComponent,
    NavComponent
  ],
  providers: [
    appRoutingProviders
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule {
}


/*
Copyright 2016 Google Inc. All Rights Reserved.
Use of this source code is governed by an MIT-style license that
can be found in the LICENSE file at http://angular.io/license
*/