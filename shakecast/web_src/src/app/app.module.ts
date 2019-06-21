import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { JsonpModule } from '@angular/http';
import { HttpClientModule } from '@angular/common/http';
import { SimpleNotificationsModule } from 'angular2-notifications';
import { AppComponent } from './app.component';
import { routing,
        appRoutingProviders } from './app.routing';

// top level modules
import { LoginModule } from './login/login.module';
import { ShakeCastModule } from './shakecast/shakecast.module';
import { ShakeCastAdminModule } from './shakecast-admin/shakecast-admin.module';

// navbar
import { NavComponent } from './nav/nav.component';
// page title
import { TitleComponent } from './title/title.component';

// General services used by multiple modules

import { SharedModule } from './shared/shared.module';


import { MessagingComponent } from './messaging/messaging.component';

import { LoadingComponent } from './loading/loading.component';

import { CoreModule } from '@core/core.module';

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CoreModule.forRoot(),
    SimpleNotificationsModule.forRoot(),
    routing,
    HttpClientModule,
    JsonpModule,
    LoginModule,
    SharedModule
  ],
  declarations: [
    AppComponent,
    NavComponent,
    TitleComponent,
    MessagingComponent,
    LoadingComponent
  ],
  providers: [
    appRoutingProviders,
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule {
}
