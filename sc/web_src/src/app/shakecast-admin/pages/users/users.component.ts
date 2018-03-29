import { Component,
         OnInit,
         OnDestroy } from '@angular/core';

import { GroupService, Group } from '../groups/group.service'
//mport { FacilityListComponent } from './facility-list.component'
import { TitleService } from '../../../title/title.service';
import { UsersService } from './users.service';

import { MapService } from '../../../shared/maps/map.service';
import { showLeft, showRight, showBottom } from '../../../shared/animations/animations';

@Component({
    selector: 'users',
    templateUrl: './users.component.html',
    styleUrls: ['./users.component.css',
                  '../../../shared/css/data-list.css',
                  '../../../shared/css/panels.css'],
    animations: [ showLeft, showRight, showBottom ]
})
export class UsersComponent {
    private subscriptions: any[] = [];
    public groupData: any = []
    public showLeft: string = 'shown';
    public showRight: string = 'shown';
    public showBottom: string = 'hidden';

    constructor(private groupService: GroupService,
                private titleService: TitleService,
                private usersService: UsersService,
                private mapService: MapService) {}

    ngOnInit() {
        this.titleService.title.next('Users and Groups');

        this.subscriptions.push(this.groupService.groupData.subscribe(data => {
            this.groupData = data;
            this.groupService.clearMap();
        })); 
    }

    deleteCurrentUser() {
        this.usersService.deleteUsers([this.usersService.current_user]);
    }
    
    saveUsers() {
        this.usersService.saveUsersFromList.next(true);
    }
}