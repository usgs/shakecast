import { Component,
         OnInit, 
         OnDestroy,
         trigger,
         state,
         style,
         transition,
         animate } from '@angular/core';

import { GroupService, Group } from './group.service'

import * as _ from 'underscore';

@Component({
    selector: 'group-list',
    templateUrl: './group-list.component.html',
    styleUrls: ['./group-list.component.css',
                    '../../../shared/css/data-list.css'], 
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
export class GroupListComponent implements OnInit, OnDestroy {
    public loadingData: boolean = false
    public groupData: any = [];
    public userGroupData: any = [];
    public noUserGroupData: any = [];
    public filter: any = {};
    public selected: Group;
    private subscriptions: any[] = [];
    private _this: any = this
    
    constructor(public groupService: GroupService) {}
    ngOnInit() {
        this.subscriptions.push(this.groupService.groupData.subscribe((data: any) => {
            this.groupData = data;
            for (var group in this.groupData) {
                this.groupData[group].selected = false;
                this.selected = this.groupData[0];
                this.selected['selected'] = true;
            }
        }));

        this.subscriptions.push(this.groupService.userGroupData.subscribe((data: any) => {
            this.userGroupData = data;
            for (var group in this.userGroupData) {
                this.userGroupData[group].selected = false;
                this.selected = this.userGroupData[0];
                this.selected['selected'] = true;

            }
            
            // build non-user data
            this.noUserGroupData = [];
            for (var group in this.groupData) {
                if (!_.findWhere(this.userGroupData, {'name': this.groupData[group]['name']})){
                    this.noUserGroupData.push(this.groupData[group])
                }
            }
            this.groupService.clearMap();
            if (this.userGroupData.length > 0) {
                this.groupService.plotGroup(this.userGroupData[0])
            }
        }));

        this.groupService.getData(this.filter);
    }

    clickGroup(group: Group) {
        this.selected['selected'] = false;
        group['selected'] = true;
        this.selected = group;
        this.groupService.current_group = group;
        this.groupService.clearMap();
        this.groupService.plotGroup(group);
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