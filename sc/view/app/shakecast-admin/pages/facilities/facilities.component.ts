import { Component,
         OnInit,
         OnDestroy } from '@angular/core';

import { FacilityListComponent } from './facility-list.component'
import { FacilityService, Facility } from './facility.service'
import { EarthquakeService } from '../../../shakecast/pages/earthquakes/earthquake.service'
import { TitleService } from '../../../title/title.service'

import { showLeft, showRight, showBottom } from '../../../shared/animations/animations';

@Component({
    selector: 'facilities',
    templateUrl: 'app/shakecast-admin/pages/facilities/facilities.component.html',
    styleUrls: ['app/shakecast-admin/pages/facilities/facilities.component.css',
                  'app/shared/css/data-list.css',
                  'app/shared/css/panels.css'],
    animations: [ showLeft, showRight, showBottom ]
})
export class FacilitiesComponent implements OnInit, OnDestroy {
    private subscriptions: any = [];
    public showBottom: string = 'hidden';
    public showLeft: string = 'hidden';
    public showRight: string = 'hidden';
    
    constructor(public facService: FacilityService,
                private titleService: TitleService,
                private eqService: EarthquakeService) {}
    ngOnInit() {
        this.titleService.title.next('Facilities')
        this.facService.clearMap()
        this.eqService.configs['clearOnPlot'] = 'events';
        this.facService.getData();
    }

    toggleLeft() {
        if (this.showLeft == 'hidden') {
            this.showLeft = 'shown';
        } else {
            this.showLeft = 'hidden'
        }
    }

    toggleRight() {
        if (this.showRight == 'hidden') {
            this.showRight = 'shown';
        } else {
            this.showRight = 'hidden'
        }
    }

    toggleBottom() {
        if (this.showBottom == 'hidden') {
            this.showBottom = 'shown';
        } else {
            this.showBottom = 'hidden'
        }
    }

    endSubscriptions() {
        for (var sub in this.subscriptions) {
            this.subscriptions[sub].unsubscribe();
        }
    }

    ngOnDestroy() {
        this.facService.clearMap();
        this.facService.facilityData.next([]);
        this.endSubscriptions()
    }
}