import { CommonModule } from '@angular/common';
import { NgModule, ModuleWithProviders } from '@angular/core';

import { NotificationsService } from 'angular2-notifications';

import { TitleService } from '../title/title.service';

import { GroupService } from '@shakecast-admin/groups/group.service';
import { UsersService } from '@shakecast-admin/users/users.service';
import { TimeService } from '@shakecast-admin/config/time.service';
import { PanelService } from '@shared/panels/panel.service';
import { UserService } from '../login/user.service';
import { EarthquakeService } from '@shakecast/earthquakes/earthquake.service';
import { FacilityService } from '@shakecast-admin/facilities/facility.service';
import { NotificationService } from '@shakecast/dashboard/notification-dash/notification.service';
import { MapService } from '@shared/maps/map.service';
import { ScreenDimmerService } from '@shared/screen-dimmer/screen-dimmer.service';

import { StickToTopService } from '@shared/directives/stick-to-top.service';
import { MessagesService } from '@shared/messages.service';
import { CookieService } from '@shared/cookie.service';
import { LoadingService } from '../loading/loading.service';

@NgModule({
    declarations: [],
    imports: [CommonModule]
  })
export class CoreModule {
static forRoot(): ModuleWithProviders {
    return {
    ngModule: CoreModule,
    providers: [
        NotificationService,
        NotificationsService,
        TitleService,
        GroupService,
        UsersService,
        TimeService,
        PanelService,
        UserService,
        EarthquakeService,
        FacilityService,
        MapService,
        ScreenDimmerService,
        StickToTopService,
        MessagesService,
        CookieService,
        LoadingService
    ]
    };
}
}
