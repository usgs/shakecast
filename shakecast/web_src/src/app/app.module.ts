import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { JsonpModule } from '@angular/http';
import { HttpClientModule } from '@angular/common/http';

import { SimpleNotificationsModule } from 'angular2-notifications';

import { AppComponent } from './app.component';
import { routing,
        appRoutingProviders } from './app.routing';
import { LoginModule } from './login/login.module';
import { NavComponent } from './nav/nav.component';
import { TitleComponent } from './title/title.component';
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
