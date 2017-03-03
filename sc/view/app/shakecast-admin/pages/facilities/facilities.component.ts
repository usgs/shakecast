import { Component,
         OnInit,
         OnDestroy } from '@angular/core';

import { FacilityListComponent } from './facility-list.component'
import { FacilityService } from './facility.service'
import { EarthquakeService } from '../../../shakecast/pages/earthquakes/earthquake.service'
import { TitleService } from '../../../title/title.service'
@Component({
    selector: 'facilities',
    templateUrl: 'app/shakecast-admin/pages/facilities/facilities.component.html',
    styleUrls: ['app/shakecast-admin/pages/facilities/facilities.component.css',
                  'app/shared/css/data-list.css'], 
})
export class FacilitiesComponent implements OnInit, OnDestroy {
    constructor(public facService: FacilityService,
                private titleService: TitleService,
                private eqService: EarthquakeService) {}
    ngOnInit() {
        this.titleService.title.next('Facilities')
        this.eqService.configs['clearOnPlot'] = 'events';
        this.facService.getData();
    }

    ngOnDestroy() {
        this.facService.clearMap();
        this.facService.facilityData.next([]);
    }
}