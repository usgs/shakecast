import { Component,
         OnInit, 
         OnDestroy,
         trigger,
         state,
         style,
         transition,
         animate } from '@angular/core';

import { GroupService, Group } from './group.service'

@Component({
    selector: 'group-list',
    templateUrl: 'app/shakecast-admin/pages/groups/group-list.component.html',
    styleUrls: ['app/shakecast-admin/pages/groups/group-list.component.css',
                    'app/shared/css/data-list.css'], 
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
    public filter: filter = {};
    public selected: Group;
    private subscriptions: any[] = [];

    constructor(private groupService: GroupService) {}
    ngOnInit() {
        this.subscriptions.push(this.groupService.groupData.subscribe(data => {
            this.groupData = data;
            for (var group in this.groupData) {
                this.groupData[group].selected = false;
                this.selected = this.groupData[0];
                this.selected.selected = true;
                
                this.groupService.clearMap();
                this.groupService.plotGroup(this.groupData[0])
            }
        }));
/*
        this.subscriptions.push(this.groupService.selection.subscribe(select => {
            if (select === 'all') {
                this.selectAll();
            } else if (select === 'none') {
                this.unselectAll();
            } else if (select === 'delete') {
            }

            this.facService.selectedFacs = this.selectedFacs;
        }));
*/
        this.subscriptions.push(this.groupService.loadingData.subscribe(loading => {
            this.loadingData = loading
        }));

        this.groupService.getData(this.filter);
    }

    clickGroup(group: Group) {
        this.selected.selected = false;
        group.selected = true;
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