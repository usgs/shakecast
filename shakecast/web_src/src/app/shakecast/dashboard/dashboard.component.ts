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

    constructor(
      public eqService: EarthquakeService,
      private titleService: TitleService
    ) {}

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

    onEqData(eqFeatureCollection) {
        if (!eqFeatureCollection || !eqFeatureCollection.features) {
          return null;
        }
        // if the list is updated, show it
        const events = eqFeatureCollection.features;
        if (!_.isEqual(this.earthquakeData, events)) {
            this.earthquakeData = events;
            if (events && events.length > 0) {

                // select new event if it just showed up
                this.eqService.selectEvent.next(events[0]);
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
