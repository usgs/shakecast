import { NgModule }       from '@angular/core';
import { BrowserModule }  from '@angular/platform-browser';
import { HttpModule, JsonpModule } from '@angular/http';
import { SimpleNotificationsModule } from 'angular2-notifications'

import { AppComponent }       from './app.component';
import { routing,
        appRoutingProviders } from './app.routing';

// top level modules
import { LoginModule } from './login/login.module'
import { ShakeCastModule } from './shakecast/shakecast.module'
import { ShakeCastAdminModule } from './shakecast-admin/shakecast-admin.module'

// General services used by all modules
import { UserService } from './login/user.service'
import { EarthquakeService } from './shakecast/pages/earthquakes/earthquake.service'
import { SharedModule } from './shared/shared.module'
import { MapService } from './shared/maps/map.service'
import { ShakemapService } from './shared/maps/shakemap.service'
import { ScreenDimmerService } from './shared/screen-dimmer/screen-dimmer.service'

import { StickToTopService } from './shared/directives/stick-to-top.service';

@NgModule({
  imports: [
    BrowserModule,
    SimpleNotificationsModule,
    routing,
    HttpModule,
    JsonpModule,
    ShakeCastModule,
    ShakeCastAdminModule,
    LoginModule,
    SharedModule
  ],
  declarations: [
    AppComponent
  ],
  providers: [
    appRoutingProviders,
    UserService,
    EarthquakeService,
    MapService,
    ShakemapService,
    StickToTopService,
    ScreenDimmerService
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule {
}