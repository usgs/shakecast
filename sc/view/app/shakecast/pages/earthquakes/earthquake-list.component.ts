import { Component, 
         OnInit, 
         OnDestroy,
         trigger,
         state,
         style,
         transition,
         animate } from '@angular/core';
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
          transition('true => false', animate('100ms ease-out')),
          transition('false => true', animate('100ms ease-in'))
      ]),
      trigger('headerSelected', [
        state('true', style({'background-color': '#7af'})),
        state('false', style({'background-color': ''})),
          transition('true => false', animate('100ms ease-out')),
          transition('false => true', animate('100ms ease-in'))
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
        //this.getEqs()
        this.subscriptions.push(this.eqService.earthquakeData.subscribe(eqs => {
            this.earthquakeData = eqs
            if ((eqs.length > 0) && 
                    (this._router.url != '/shakecast-admin/facilities')) {
                this.selectEq(eqs[0]);
            }
        }));

        this.subscriptions.push(this.eqService.dataLoading.subscribe((loading: boolean) => {
            this.dataLoading = loading
        }));

        if (this._router.url == '/shakecast/dashboard') {
            this.filter['timeframe'] = 'day';
        }
    }

    plotEq(eq: Earthquake) {
        this.eqService.plotEq(eq)
        this.selectEq(eq);
    }

    selectEq(eq: Earthquake) {
        if (this.selected) {
            this.selected['selected'] = false;
        }
        eq['selected'] = true;
        this.selected = eq;
    }

    ngOnDestroy() {
        this.endSubscriptions()
    }

    endSubscriptions() {
        for (var sub in this.subscriptions) {
            this.subscriptions[sub].unsubscribe()
        }
    }
    
}