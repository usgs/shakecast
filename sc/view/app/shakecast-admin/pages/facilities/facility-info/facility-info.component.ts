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
    styleUrls: ['app/shakecast-admin/pages/facilities/facility-info/facility-info.component.css'],  
    animations: [
      trigger('show', [
        state('false', style({left: '100%'})),
        state('true', style({left: '55%'})),
          transition('true => false', animate('500ms ease-out')),
          transition('false => true', animate('500ms ease-in'))
      ]),
      trigger('shrinkDesc', [
        state('true', style({opacity: 0,
                                display: 'none'})),
        state('false', style({opacity: 1,
                                display: 'block'})),
          transition('true => false', animate('500ms ease-in-out')),
          transition('false => true', animate('500ms ease-in-out'))
      ]),
      trigger('shrinkBody', [
        state('false', style({marginTop: '20%'})),
        state('true', style({marginTop: '5px'})),
          transition('true => false', animate('500ms ease-in-out')),
          transition('false => true', animate('500ms ease-in-out'))
      ]),
      trigger('showFragility', [
        state('true', style({top: 0})),
        state('false', style({top: '100%'})),
          transition('true => false', animate('500ms ease-in-out')),
          transition('false => true', animate('500ms ease-in-out'))
      ]),
      trigger('enlargeInfo', [
        state('true', style({height: '85%'})),
        state('false', style({height: '70%'})),
          transition('true => false', animate('500ms ease-in-out')),
          transition('false => true', animate('500ms ease-in-out'))
      ])
    ]
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
                this.showFragilityInfo = false;
                this.show = true;
                this.facility = facility;

                if (this._router.url == '/shakecast/dashboard') {
                    this.facilityShaking = facility['shaking'];
                } else {
                    this.facilityShaking = null;
                }

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

    showFragility(fac: Facility) {
        this.showFragilityInfo = !this.showFragilityInfo;

        if (this.showFragilityInfo) {
            this.eqService.getFacilityData(fac);
        }
    }

    showInfo() {

    }

    hide() {
        this.show = false;
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
