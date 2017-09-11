import { Component, 
         OnInit, 
         OnDestroy } from '@angular/core';

import { trigger,
         state,
         style,
         animate,
         transition } from '@angular/animations';

import { Router } from '@angular/router';
import { EarthquakeService, Earthquake } from './earthquake.service';

import { filter } from './earthquake-filter/earthquake-filter.component';

@Component({
    selector: 'earthquake-list',
    templateUrl: 'app/shakecast/pages/earthquakes/earthquake-list.component.html',
    styleUrls: ['app/shakecast/pages/earthquakes/earthquake-list.component.css',
                    'app/shared/css/data-list.css'],
    animations: [
      trigger('selected', [
        state('true', style({transform: 'translateY(-10px)'})),
        state('false', style({transform: 'translateY(0px)'})),
          transition('* => *', animate('200ms ease-out'))
      ]),
      trigger('headerSelected', [
        state('true', style({'background-color': '#7af'})),
        state('false', style({'background-color': '*'}))
      ])
    ]
})
export class EarthquakeListComponent implements OnInit, OnDestroy {
    public earthquakeData: any = [];
    public pulledRight: boolean = false;
    public dataLoading: boolean = false;
    public moreData: boolean = false;
    public selected: Earthquake = null;

    public filter: filter = {
        shakemap: false,
        facilities: false
    }
    private subscriptions: any[] = []
    constructor(private eqService: EarthquakeService,
                private _router: Router) {}

    ngOnInit() {
        this.subscriptions.push(this.eqService.earthquakeData.subscribe((eqs: any[]) => {
            this.earthquakeData = eqs
            if ((eqs.length > 0) && 
                    (this._router.url != '/shakecast-admin/facilities')) {
                this.selectEq(eqs[0]);
            }
        }));

        this.subscriptions.push(this.eqService.dataLoading.subscribe((loading: boolean) => {
            this.dataLoading = loading
        }));
    }

    plotEq(eq: Earthquake) {
        this.eqService.mapService.clearMap();
        this.eqService.plotEq(eq)
        this.selectEq(eq);
    }

    selectEq(eq: Earthquake) {
        if (this.selected) {
            this.selected['selected'] = 'false';
        }
        eq['selected'] = 'true';
        this.selected = eq;
        this.eqService.selected = eq;
    }

    ngOnDestroy() {
        this.earthquakeData = [];
        this.eqService.current = [];
        this.endSubscriptions()
    }

    endSubscriptions() {
        for (var sub in this.subscriptions) {
            this.subscriptions[sub].unsubscribe()
        }
    }
    
}