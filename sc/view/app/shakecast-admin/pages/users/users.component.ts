import { Component,
         OnInit,
         OnDestroy } from '@angular/core';

import { GroupService, Group } from '../groups/group.service'
//mport { FacilityListComponent } from './facility-list.component'
import { TitleService } from '../../../title/title.service';

@Component({
    selector: 'users',
    templateUrl: 'app/shakecast-admin/pages/users/users.component.html',
    styleUrls: ['app/shakecast-admin/pages/users/users.component.css'], 
})
export class UsersComponent {
    private subscriptions: any[] = [];

    constructor(private groupService: GroupService,
                private titleService: TitleService) {}

    ngOnInit() {
        this.titleService.title.next('Users');
        this.subscriptions.push(this.groupService.groupData.subscribe(data => {
            this.groupData = data;

            this.groupService.clearMap();
            for (var group in this.groupData) {
                this.groupService.plotGroup(this.groupData[group])
            }
        })); 
    }
}