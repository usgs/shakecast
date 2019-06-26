import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ShakeCastComponent } from './shakecast.component';
import { routing } from './shakecast.routing';

import { DashboardComponent } from './dashboard/dashboard.component';
import { NotificationDashComponent } from './dashboard/notification-dash/notification-dash.component';

import { EarthquakeFilter } from './earthquakes/earthquake-filter/earthquake-filter.component';

import { UserProfileComponent } from './user-profile/user-profile.component';

import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [
    FormsModule,
    CommonModule,
    routing,
    SharedModule
  ],
  declarations: [
    ShakeCastComponent,
    DashboardComponent,
    NotificationDashComponent,
    EarthquakeFilter,
    UserProfileComponent
  ],
  providers: [
  ]
})
export class ShakeCastModule {
}
