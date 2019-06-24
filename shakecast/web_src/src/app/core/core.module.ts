import { CommonModule } from '@angular/common';
import { NgModule, ModuleWithProviders } from '@angular/core';

import { NotificationsService } from 'angular2-notifications';

import { TitleService } from './title.service';

import { GroupService } from './group.service';
import { UsersService } from './users.service';
import { TimeService } from './time.service';
import { PanelService } from './panel.service';
import { UserService } from './user.service';
import { EarthquakeService } from './earthquake.service';
import { FacilityService } from './facility.service';
import { NotificationService } from './notification.service';
import { MapService } from './map.service';
import { ScreenDimmerService } from './screen-dimmer.service';
import { StickToTopService } from './stick-to-top.service';
import { MessagesService } from './messages.service';
import { CookieService } from './cookie.service';
import { LoadingService } from './loading.service';

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
