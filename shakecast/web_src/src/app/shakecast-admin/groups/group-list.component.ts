import { Component,
         OnInit,
         OnDestroy } from '@angular/core';
import { trigger,
         state,
         style,
         transition,
         animate } from '@angular/animations';

import { GroupService, Group } from '@core/group.service';

import * as _ from 'underscore';

@Component({
    selector: 'group-list',
    templateUrl: './group-list.component.html',
    styleUrls: ['./group-list.component.css',
                    '../../shared/css/data-list.css'],
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
    public loadingData = false;
    public groupData: any = [];
    public userGroupData: any = [];
    public noUserGroupData: any = [];
    public filter: any = {};
    public selected: any;
    private subscriptions: any[] = [];
    private _this: any = this;

    constructor(public groupService: GroupService) {}
    ngOnInit() {
        this.subscriptions.push(this.groupService.groupData.subscribe((data: any) => {
            if (!data || !data.features) {
              this.groupData = null;
            }

            this.groupData = data;

            this.clickGroup(this.groupData.features[0]);
        }));

        this.groupService.getData(this.filter);
    }

    clickGroup(group: Group) {
        if (this.selected) {
          this.selected.selected = false;
        }

        if (!group) {
          return null;
        }

        group['selected'] = true;
        this.selected = group;
        this.groupService.current_group = group;
        this.groupService.clearMap();
        this.groupService.plotGroup(group);
    }

    ngOnDestroy() {
        this.endSubscriptions();
    }

    endSubscriptions() {
        for (const sub of this.subscriptions) {
            sub.unsubscribe();
        }
    }
}
