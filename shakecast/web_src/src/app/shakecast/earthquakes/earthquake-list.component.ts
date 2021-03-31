import { Component, Input, OnInit } from '@angular/core';

import { trigger,
         state,
         style,
         animate,
         transition } from '@angular/animations';

import { Subscription } from 'rxjs';
import * as _ from 'underscore';

import { EarthquakeService, Earthquake } from '@core/earthquake.service';
import { filter } from '@core/earthquake.service';

@Component({
    selector: 'earthquake-list',
    templateUrl: './earthquake-list.component.html',
    styleUrls: ['./earthquake-list.component.css',
                    '../../shared/css/data-list.css'],
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
export class EarthquakeListComponent implements OnInit {
    public selected: Earthquake = null;

    @Input()
    facility = null;

    public filter: filter = {
        shakemap: false,
        facilities: false
    };

    constructor(public eqService: EarthquakeService) {}

    ngOnInit() {
      if (this.facility) {
        this.eqService.getData({facility: this.facility});
      }
    }

    plotEq(eq: Earthquake) {
        this.selected = eq;
        this.eqService.selected = eq;
        this.eqService.selectEvent.next(eq);
    }
}
