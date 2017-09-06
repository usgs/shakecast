import { Component,
         OnInit, 
         OnDestroy,
         HostListener,
         trigger,
         state,
         style,
         transition,
         animate } from '@angular/core';

import { UsersService, User } from './users.service'
import { GroupService, Group } from '../groups/group.service'
declare var _: any;

@Component({
    selector: 'user-list',
    templateUrl: 'app/shakecast-admin/pages/users/user-list.component.html',
    styleUrls: ['app/shared/css/data-list.css', 'app/shakecast-admin/pages/users/user-list.component.css'],
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
    private oldData: any = [];
    public filter: filter = {};
    public selected: User = null;
    public editing: User = null;
    private subscriptions: any[] = [];

    constructor(public userService: UsersService,
                private groupService: GroupService) {}

    ngOnInit() {
        this.subscriptions.push(this.userService.userData.subscribe(data => {
            this.dataList = data;
            for (var user in this.dataList) {
                this.dataList[user]['selected'] = false;
            }

            this.selected = this.dataList[0];
            this.selected['selected'] = true;
            this.oldData = JSON.parse(JSON.stringify(this.dataList));
            this.clickData(this.dataList[0]);
        }));

        this.subscriptions.push(this.userService.loadingData.subscribe(loading => {
            this.loadingData = loading;
        }));
        
        this.subscriptions.push(this.userService.saveUsersFromList.subscribe(saveUsers => {
            if ((saveUsers === true) && (!_.isEqual(this.dataList ,this.oldData))){
                this.oldData = JSON.parse(JSON.stringify(this.dataList));
                this.saveUsers();
                this.userService.saveUsersFromList.next(false);
            }
        }));

        this.userService.getData();

    }

    clickData(data: any) {
        this.selected['selected'] = false;
        data.selected = true;
        this.selected = data;
        this.userService.current_user = data;
        this.groupService.getData({'user': data.username})
    }

    editUser(user: User) {
        if (this.editing) {
            this.editing['editing'] = false;
        }

        this.editing = user;
        this.editing['editing'] = true;
    }

    saveUsers() {
        this.userService.saveUsers(this.dataList)
    }

    @HostListener('window:keydown', ['$event'])
    keyboardInput(event: any) {
        if (event.keyCode === 13) {
            this.editing['editing'] = false;
        }
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