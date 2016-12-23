import { Component,
         OnInit, 
         OnDestroy,
         trigger,
         state,
         style,
         transition,
         animate } from '@angular/core';

import { GroupService } from './group.service'

@Component({
    selector: 'groups',
    templateUrl: 'app/shakecast-admin/pages/groups/groups.component.html',
    styleUrls: ['app/shakecast-admin/pages/groups/groups.component.css'], 
})
export class GroupsComponent implements OnInit {
    constructor(private groupService: GroupService) {}

    ngOnInit() {
        //this.groupService.clearMap();
    }
}