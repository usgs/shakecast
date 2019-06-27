import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ShakeCastAdminComponent } from './shakecast-admin.component';
import { routing } from './shakecast-admin.routing';

import { FacilitiesComponent } from './facilities/facilities.component';
import { FacilityFilter } from './facilities/facility-filter/facility-filter.component';

import { GroupsComponent } from './groups/groups.component';
import { GroupListComponent } from './groups/group-list.component';

import { UsersComponent } from './users/users.component';
import { UserListComponent } from './users/user-list.component';

import { ConfigComponent } from './config/config.component';
import { ConfigService } from './config/config.service';

import { UploadComponent } from './upload/upload.component';
import { UploadService } from './upload/upload.service';

import { NotificationsModule } from './notifications/notifications.module';

import { UpdateComponent } from './update/update.component';
import { UpdateService } from './update/update.service';

import { ScenariosComponent } from './scenarios/scenarios.component';
import { ScenarioSearchComponent } from './scenarios/scenario-search/scenario-search.component';

import { SharedModule } from '../shared/shared.module';

// ng2-file-upload
import { FileUploadModule } from 'ng2-file-upload';

@NgModule({
  imports: [
    FormsModule,
    FileUploadModule,
    NotificationsModule,
    routing,
    SharedModule
  ],
  declarations: [
    ShakeCastAdminComponent,
    FacilitiesComponent,
    FacilityFilter,
    GroupsComponent,
    GroupListComponent,
    UsersComponent,
    UserListComponent,
    ConfigComponent,
    UploadComponent,
    UpdateComponent,
    ScenariosComponent,
    ScenarioSearchComponent
  ],
  providers: [
    ConfigService,
    UploadService,
    UpdateService
  ]
})
export class ShakeCastAdminModule {
}