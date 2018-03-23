import { Component,
         OnInit,
         OnDestroy, AfterViewInit } from '@angular/core';

import { FacilityListComponent } from './facility-list.component'
import { FacilityService, Facility } from './facility.service'
import { EarthquakeService } from '../../../shakecast/pages/earthquakes/earthquake.service'
import { TitleService } from '../../../title/title.service'

@Component({
    selector: 'facilities',
    templateUrl: './facilities.component.html',
    styleUrls: ['./facilities.component.css',
                  '../../../shared/css/data-list.css',
                  '../../../shared/css/panels.css']
})
export class FacilitiesComponent implements OnInit, OnDestroy {
    private subscriptions: any = [];
    public facList: any[] = [];
    
    constructor(public facService: FacilityService,
                private titleService: TitleService,
                private eqService: EarthquakeService) {}
    ngOnInit() {
        this.eqService.clearData();

        this.titleService.title.next('Facilities')
        this.subscriptions.push(this.facService.facilityData.subscribe((facs: any[]) => {
            if (facs.length > 0) {
                this.facList = facs;
                this.facService.plotFac(facs[0]);
            }
        }));

        this.facService.getData();
    }

    endSubscriptions() {
        for (var sub in this.subscriptions) {
            this.subscriptions[sub].unsubscribe();
        }
    }

    ngOnDestroy() {
        this.facService.clearMap();
        this.facService.facilityData.next([]);
        this.facService.facilityCount.next([]);
        this.endSubscriptions()
    }
}