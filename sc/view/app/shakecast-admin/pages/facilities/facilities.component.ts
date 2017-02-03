import { Component,
          OnInit } from '@angular/core';

import { FacilityListComponent } from './facility-list.component'
import { FacilityService } from './facility.service'
import { TitleService } from '../../../title/title.service'
@Component({
    selector: 'facilities',
    templateUrl: 'app/shakecast-admin/pages/facilities/facilities.component.html',
    styleUrls: ['app/shakecast-admin/pages/facilities/facilities.component.css',
                  'app/shared/css/data-list.css'], 
})
export class FacilitiesComponent implements OnInit{
    constructor(public facService: FacilityService,
                private titleService: TitleService) {}
    ngOnInit() {
        this.titleService.title.next('Facilities')
        this.facService.getData();
    }
}