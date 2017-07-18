import { Component,
         OnInit,
         OnDestroy, AfterViewInit } from '@angular/core';

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
export class FacilitiesComponent implements OnInit, OnDestroy, AfterViewInit {
    private subscriptions: any = [];
    public showBottom: string = 'hidden';
    public showLeft: string = 'hidden';
    public showRight: string = 'hidden';
    public facList: any[] = [];
    
    constructor(public facService: FacilityService,
                private titleService: TitleService,
                private eqService: EarthquakeService) {}
    ngOnInit() {
        this.titleService.title.next('Facilities')
        this.subscriptions.push(this.facService.facilityData.subscribe((facs: any[]) => {
            if (facs.length > 0) {
                this.facList = facs;
                this.facService.plotFac(facs[0]);
            }
        }));
        this.eqService.configs['clearOnPlot'] = 'events';
        this.facService.getData();
        this.toggleRight();
    }

    ngAfterViewInit() {
        /*
        this.facService.clearMap()
        if (this.facList.length > 0) {
            this.facService.plotFac(this.facList[0]);
        }
        */
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