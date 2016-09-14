import { NgModule }       from '@angular/core';
import { BrowserModule }  from '@angular/platform-browser';
import { FormsModule }    from '@angular/forms';
import { HttpModule, JsonpModule } from '@angular/http';
import { SimpleNotificationsModule } from 'angular2-notifications'

import { AppComponent }       from './app.component';
import { routing,
        appRoutingProviders } from './app.routing';

import { LoginModule } from './login/login.module'
import { ShakeCastModule } from './shakecast/shakecast.module'
import { ShakeCastAdminModule } from './shakecast-admin/shakecast-admin.module'

import { UserService } from './login/user.service'
import { EarthquakeService } from './shakecast/pages/earthquakes/earthquake.service'

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    SimpleNotificationsModule,
    routing,
    HttpModule,
    JsonpModule,
    ShakeCastModule,
    ShakeCastAdminModule,
    LoginModule
  ],
  declarations: [
    AppComponent
  ],
  providers: [
    appRoutingProviders,
    UserService,
    EarthquakeService
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule {
}