import { Component,
         OnInit,
         OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

import { Subscription } from 'rxjs';

import { FacilityService, Facility } from '@core/facility.service';
import { EarthquakeService } from '@core/earthquake.service';

@Component({
    selector: 'facility-info',
    templateUrl: './facility-info.component.html',
    styleUrls: ['./facility-info.component.css']
})
export class FacilityInfoComponent implements OnInit, OnDestroy{
    private subscriptions = new Subscription();
    private show = false;
    public facility: Facility = null;
    public facilityShaking: any = null;
    public showFragilityInfo = false;

    constructor(
      private facService: FacilityService,
      private eqService: EarthquakeService,
      public _router: Router
    ) {}

    ngOnInit() {
      this.subscriptions.add(this.facService.select.subscribe((facility: Facility) => {
        this.onFacility(facility);
      }));

      this.subscriptions.add(this.facService.facilityShaking.subscribe((shaking: any) => {
        this.facilityShaking = shaking;
      }));
    }

    onFacility(facility) {
        if (!facility) {
          this.facility = null;
          return;
        }
    }

    ngOnDestroy() {
        this.endSubscriptions();
    }

    endSubscriptions() {
        this.subscriptions.unsubscribe();
    }
}
