import { Component, 
         OnInit,
         OnDestroy,
         trigger,
         state,
         style,
         transition,
         animate } from '@angular/core';
import { Router } from '@angular/router';

import { FacilityService, Facility } from '../facility.service';
import { EarthquakeService, Earthquake } from '../../../../shakecast/pages/earthquakes/earthquake.service'

@Component({
    selector: 'facility-info',
    templateUrl: 'app/shakecast-admin/pages/facilities/facility-info/facility-info.component.html',
    styleUrls: ['app/shakecast-admin/pages/facilities/facility-info/facility-info.component.css']
})
export class FacilityInfoComponent implements OnInit, OnDestroy{
    private subscriptions: any[] = [];
    private show: boolean = false;
    public facility: Facility = null;
    public facilityShaking: any = null;
    public showFragilityInfo: boolean = false;
    constructor(private facService: FacilityService,
                private eqService: EarthquakeService,
                public _router: Router) {}

    ngOnInit() {
        this.subscriptions.push(this.facService.showInfo.subscribe((facility: Facility) => {
            if (facility) {
                this.setFacility(facility)
            } else {
                this.show = false;
            }
        }));

        this.subscriptions.push(this.facService.facilityInfo.subscribe((facility: Facility) => {
            this.facility = facility;
        }));

        this.subscriptions.push(this.eqService.plotting.subscribe((eq: Earthquake) => {
            if (this.facility) {
                this.facService.getFacilityShaking(this.facility, eq);
            }
        }));

        this.subscriptions.push(this.facService.facilityShaking.subscribe((shaking: any) => {
            this.facilityShaking = shaking;
        }));
    }

    setFacility(facility: Facility) {
        this.facility = facility;
        this.eqService.getFacilityData(facility);
    }

    hide() {
        this.facService.showInfo.next(null)
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
