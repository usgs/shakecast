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
import { FacilityFilter } from './pages/facilities/facility-filter/facility-filter.component'

import { EarthquakesComponent } from './pages/earthquakes/earthquakes.component'
import { EarthquakeListComponent } from './pages/earthquakes/earthquake-list.component'

import { GroupsComponent } from './pages/groups/groups.component'
import { GroupListComponent } from './pages/groups/group-list.component'

import { UsersComponent } from './pages/users/users.component'
import { UserListComponent } from './pages/users/user-list.component'

import { ConfigComponent } from './pages/config/config.component'
import { ConfigService } from './pages/config/config.service'

//import { UploadComponent } from './pages/upload/upload.component'

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
    FacilityFilter,
    EarthquakesComponent,
    EarthquakeListComponent,
    GroupsComponent,
    GroupListComponent,
    UsersComponent,
    UserListComponent,
    ConfigComponent
    //UploadComponent
  ],
  providers: [
    ConfigService
  ]
})
export class ShakeCastAdminModule {
}