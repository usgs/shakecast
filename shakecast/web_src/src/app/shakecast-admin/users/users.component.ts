import { Component,
         OnInit,
         OnDestroy } from '@angular/core';

import { Subscription } from 'rxjs';

import { GroupService } from '@core/group.service';
import { TitleService } from '@core/title.service';
import { UsersService } from '@core/users.service';

import { MapService } from '@core/map.service';
import { showLeft, showRight, showBottom } from '@shared/animations/animations';

@Component({
    selector: 'users',
    templateUrl: './users.component.html',
    styleUrls: ['./users.component.css',
                  '../../shared/css/data-list.css',
                  '../../shared/css/panels.css'],
    animations: [ showLeft, showRight, showBottom ]
})
export class UsersComponent implements OnInit, OnDestroy {
    private subscriptions = new Subscription()
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

        this.subscriptions.add(this.groupService.groupData.subscribe(data => {
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

    ngOnDestroy() {
        this.subscriptions.unsubscribe();
    }
}
