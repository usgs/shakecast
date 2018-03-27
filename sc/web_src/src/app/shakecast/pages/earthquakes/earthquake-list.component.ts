import { Component, 
         OnInit, 
         OnDestroy } from '@angular/core';

import { trigger,
         state,
         style,
         animate,
         transition } from '@angular/animations';
import { Subscription } from 'rxjs/subscription';

import { Router } from '@angular/router';
import { EarthquakeService, Earthquake } from './earthquake.service';

import { filter } from './earthquake.service';

import * as _ from 'underscore';

@Component({
    selector: 'earthquake-list',
    templateUrl: './earthquake-list.component.html',
    styleUrls: ['./earthquake-list.component.css',
                    '../../../shared/css/data-list.css'],
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
    private subs = new Subscription();

    constructor(private eqService: EarthquakeService,
                private _router: Router) {}

    ngOnInit() {
        this.subs.add(this.eqService.earthquakeData.subscribe((eqs: any[]) => {
            this.onEqs(eqs);
        }));

        this.subs.add(this.eqService.dataLoading.subscribe((loading: boolean) => {
            this.dataLoading = loading
        }));

        this.subs.add(this.eqService.selectEvent.subscribe(event => {
            this.onSelectEvent(event);
        }));
    }

    onEqs(eqs) {
        if (eqs == null) {
            this.earthquakeData = [];
            return
        }

        // update data if required
        if (!_.isEqual(this.earthquakeData, eqs)) {
            this.earthquakeData = eqs
        }
    }

    onSelectEvent(event) {
        this.selected = event;
    }

    plotEq(eq: Earthquake) {
        this.selectEq(eq);
    }

    selectEq(eq: Earthquake) {
        this.selected = eq;
        this.eqService.selected = eq;
        this.eqService.selectEvent.next(eq);
    }

    ngOnDestroy() {
        this.earthquakeData = [];
        this.eqService.current = [];
        this.endSubscriptions()
    }

    endSubscriptions() {
        this.subs.unsubscribe();
    }
    
}