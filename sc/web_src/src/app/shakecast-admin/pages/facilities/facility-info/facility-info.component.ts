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
    templateUrl: './facility-info.component.html',
    styleUrls: ['./facility-info.component.css']
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
        this.subscriptions.push(this.facService.select.subscribe((facility: Facility) => {
            this.onFacility(facility);
        }));

        this.subscriptions.push(this.facService.facilityShaking.subscribe((shaking: any) => {
            this.facilityShaking = shaking;
        }));
    }

    onFacility(facility) {
        if (facility === null) {
                this.facility = null;
                return
            }
        this.setFacility(facility);
    }

    setFacility(facility: Facility) {
        this.facility = facility;
        this.eqService.getFacilityData(facility);
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
