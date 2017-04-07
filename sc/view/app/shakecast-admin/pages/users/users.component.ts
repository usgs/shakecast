import { Component,
         OnInit,
         OnDestroy } from '@angular/core';

import { GroupService, Group } from '../groups/group.service'
//mport { FacilityListComponent } from './facility-list.component'
import { TitleService } from '../../../title/title.service';
import { UsersService } from './users.service';

import { MapService } from '../../../shared/maps/map.service';

@Component({
    selector: 'users',
    templateUrl: 'app/shakecast-admin/pages/users/users.component.html',
    styleUrls: ['app/shakecast-admin/pages/users/users.component.css',
                  'app/shared/css/data-list.css'], 
})
export class UsersComponent {
    private subscriptions: any[] = [];
    public groupData: any = []
    constructor(private groupService: GroupService,
                private titleService: TitleService,
                private usersService: UsersService,
                private mapService: MapService) {}

    ngOnInit() {
        this.titleService.title.next('Users');

        this.subscriptions.push(this.groupService.groupData.subscribe(data => {
            this.groupData = data;
            this.groupService.clearMap();
            /*
            for (var group in this.groupData) {
                this.groupService.plotGroup(this.groupData[group])
            }
            */
        })); 
    }

    deleteCurrentUser() {
        this.usersService.deleteUsers([this.usersService.current_user]);
    }
    
    saveUsers() {
        this.usersService.saveUsersFromList.next(true);
    }
}