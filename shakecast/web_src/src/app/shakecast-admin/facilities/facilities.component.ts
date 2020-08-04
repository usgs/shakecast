import { Component,
         OnInit,
         OnDestroy } from '@angular/core';

import { Subscription } from 'rxjs';

import { FacilityService } from '@core/facility.service';
import { EarthquakeService } from '@core/earthquake.service';
import { TitleService } from '@core/title.service';

@Component({
    selector: 'facilities',
    templateUrl: './facilities.component.html',
    styleUrls: ['./facilities.component.css',
                  '../../shared/css/data-list.css']
})
export class FacilitiesComponent implements OnInit, OnDestroy {
    private subscriptions = new Subscription();
    public facList: any[] = [];

    constructor(public facService: FacilityService,
                private titleService: TitleService,
                private eqService: EarthquakeService) {}
    ngOnInit() {
        this.eqService.clearData();

        this.titleService.title.next('Facilities');
        this.subscriptions.add(this.facService.facilityData.subscribe((facs: any[]) => {
            if ((facs != null) && (facs.length > 0)) {
                this.facList = facs;
                this.facService.select.next(facs[0]);
            }
        }));

        this.facService.getData(
          this.facService.filter
        );
    }

    plotFac(fac) {
        this.facService.select.next(fac);
    }

    endSubscriptions() {
        this.subscriptions.unsubscribe();
    }

    ngOnDestroy() {
        this.facService.clearMap();
        this.facService.facilityData.next([]);
        this.facService.facilityCount.next([]);
        this.facService.select.next(null);
        this.eqService.selectEvent.next(null);
        this.eqService.earthquakeData.next(null);
        this.endSubscriptions();
    }
}