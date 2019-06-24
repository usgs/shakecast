import { Component,
         OnInit,
         OnDestroy } from '@angular/core';

import { EarthquakeService } from '@core/earthquake.service';
import { FacilityService } from '@core/facility.service';
import { TitleService } from '@core/title.service';

import { Subscription, timer } from 'rxjs';
import { LoadingService } from '@core/loading.service';

import * as _ from 'underscore';

@Component({
    selector: 'dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css',
                  '../../shared/css/panels.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
    public facilityData: any = [];
    public earthquakeData: any = [];
    private subscriptions = new Subscription();

    constructor(private eqService: EarthquakeService,
                private facService: FacilityService,
                private titleService: TitleService,
                private loadingService: LoadingService) {}

    ngOnInit() {
        this.titleService.title.next('Dashboard');

        this.eqService.filter['timeframe'] = 'day';
        this.eqService.filter['shakemap'] = true;
        this.eqService.filter['scenario'] = false;

        this.subscriptions.add(timer(0, 60000)
            .subscribe((x: any) => {
                this.eqService.getData(this.eqService.filter);
        }));

        this.subscriptions.add(this.eqService.earthquakeData.subscribe((eqs: any[]) => {
            this.onEqData(eqs);
        }));
    }

    onEqData(eqs) {
        // if the list is updated, show it
        if (!_.isEqual(this.earthquakeData, eqs)) {
            this.earthquakeData = eqs;
            if (eqs && eqs.length > 0) {

                // select new event if it just showed up
                this.eqService.selectEvent.next(eqs[0]);
            }
        }
    }

    endSubscriptions() {
        this.subscriptions.unsubscribe();
    }

    ngOnDestroy() {
        this.eqService.earthquakeData.next([]);
        this.eqService.selectEvent.next(null);
        this.eqService.clearData();
        this.endSubscriptions();
    }
}
