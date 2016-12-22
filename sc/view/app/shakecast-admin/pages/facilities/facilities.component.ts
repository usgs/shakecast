import { Component,
          OnInit } from '@angular/core';

import { FacilityListComponent } from './facility-list.component'
import { FacilityService } from './facility.service'

@Component({
    selector: 'facilities',
    templateUrl: 'app/shakecast-admin/pages/facilities/facilities.component.html',
    styleUrls: ['app/shakecast-admin/pages/facilities/facilities.component.css'], 
})
export class FacilitiesComponent implements OnInit{
    constructor(private facService: FacilityService) {}
    ngOnInit() {
        this.facService.clearMap();
    }
}