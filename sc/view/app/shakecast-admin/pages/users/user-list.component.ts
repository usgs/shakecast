import { Component,
         OnInit, 
         OnDestroy,
         trigger,
         state,
         style,
         transition,
         animate } from '@angular/core';

import { UsersService, User } from './users.service'
import { GroupService, Group } from '../groups/group.service'
@Component({
    selector: 'user-list',
    templateUrl: 'app/shakecast-admin/pages/users/user-list.component.html',
    styleUrls: ['app/shared/css/data-list.css'],
    animations: [
      trigger('selected', [
        state('true', style({transform: 'translateY(-10px)'})),
        state('false', style({transform: 'translateY(0px)'})),
          transition('true => false', animate('100ms ease-out')),
          transition('false => true', animate('100ms ease-in'))
      ]),
      trigger('headerSelected', [
        state('true', style({'background-color': '#7af'})),
        state('false', style({'background-color': '#aaaaaa'})),
          transition('true => false', animate('100ms ease-out')),
          transition('false => true', animate('100ms ease-in'))
      ])

    ]
})
export class UserListComponent implements OnInit, OnDestroy {
    public loadingData: boolean = false;
    public dataList: any = [];
    public filter: filter = {};
    public selected: User;
    private subscriptions: any[] = [];

    constructor(private userService: UsersService,
                private groupService: GroupService) {}

    ngOnInit() {
        this.subscriptions.push(this.userService.userData.subscribe(data => {
            this.dataList = data;
            for (var user in this.dataList) {
                this.dataList[user].selected = false;
                this.selected = this.dataList[0];
                this.selected.selected = true;

                //this.userService.plotGroup(this.groupData[0])
            }
        }));

        this.subscriptions.push(this.userService.loadingData.subscribe(loading => {
            this.loadingData = loading;
        }));

        this.userService.getData();

    }

    clickData(data: any) {
        this.selected.selected = false;
        data.selected = true;
        this.selected = data;
        this.userService.current_user = data;
        this.groupService.getData({'user': data.username})
    }

    ngOnDestroy() {
        this.endSubscriptions()
    }

    endSubscriptions() {
        for (var sub in this.subscriptions) {
            this.subscriptions[sub].unsubscribe();
        }
    }

}