import { Component,
         OnInit,
         OnDestroy,
         AfterViewInit } from '@angular/core';

import { EarthquakeService } from '../earthquakes/earthquake.service'
import { FacilityService } from '../../../shakecast-admin/pages/facilities/facility.service'
import { TitleService } from '../../../title/title.service';

import { TimerObservable } from "rxjs/observable/TimerObservable";
import { LoadingService } from '../../../loading/loading.service';

import * as _ from 'underscore';

@Component({
    selector: 'dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css',
                  '../../../shared/css/panels.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
    public facilityData: any = [];
    public earthquakeData: any = [];
    private subscriptions: any[] = [];

    constructor(private eqService: EarthquakeService,
                private facService: FacilityService,
                private titleService: TitleService,
                private loadingService: LoadingService) {}
  
    ngOnInit() {
        this.titleService.title.next('Dashboard')

        this.eqService.filter['timeframe'] = 'day'
        this.eqService.filter['shakemap'] = true
        this.eqService.filter['scenario'] = false

        this.subscriptions.push(TimerObservable.create(0, 60000)
            .subscribe((x: any) => {
                this.eqService.getData(this.eqService.filter);
        }));

        this.subscriptions.push(this.eqService.earthquakeData.subscribe((eqs: any[]) => {
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
        for (var sub in this.subscriptions) {
            this.subscriptions[sub].unsubscribe()
        }
    }

    ngOnDestroy() {
        this.eqService.earthquakeData.next([]);
        this.eqService.selectEvent.next(null);
        this.eqService.clearData();
        this.endSubscriptions()
    }
}