import { Component,
         OnInit } from '@angular/core';
import { TitleService } from '@core/title.service';
import { GroupService } from '@core/group.service';

@Component({
    selector: 'groups',
    templateUrl: './groups.component.html',
    styleUrls: ['./groups.component.css',
                  '../../shared/css/data-list.css']
})
export class GroupsComponent implements OnInit {
    constructor(private groupService: GroupService,
                private titleService: TitleService) {}

    ngOnInit() {
        this.titleService.title.next('Groups');
    }
}
