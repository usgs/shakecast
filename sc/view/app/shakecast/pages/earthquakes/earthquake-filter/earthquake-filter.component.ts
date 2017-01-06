import { Component, 
         OnInit,
         trigger,
         state,
         style,
         transition,
         animate } from '@angular/core';
import { EarthquakeService, Earthquake } from '../earthquake.service'
import { ScreenDimmerService } from '../../../../shared/screen-dimmer/screen-dimmer.service'
import { NotificationsService } from 'angular2-notifications'

@Component({
    selector: 'eq-filter',
    templateUrl: 'app/shakecast/pages/earthquakes/earthquake-filter/earthquake-filter.component.html',
    styleUrls: ['app/shakecast/pages/earthquakes/earthquake-filter/earthquake-filter.component.css'],  
    animations: [
      trigger('filterShown', [
        state('false', style({bottom: '-150px'})),
        state('true', style({bottom: '200px'})),
          transition('true => false', animate('100ms ease-out')),
          transition('false => true', animate('100ms ease-in'))
      ])
    ]
})
export class EarthquakeFilter {
    public filterShown = false;

    public filter: filter = {
        shakemap: true,
        facilities: false
    }
    public options = {
        timeOut: 0,
        lastOnBottom: true,
        clickToClose: true,
        maxLength: 0,
        maxStack: 7,
        showProgressBar: false,
        pauseOnHover: true
    };
    constructor(private eqService: EarthquakeService,
                private sdService: ScreenDimmerService,
                private notService: NotificationsService) {}

    search() {
        this.eqService.getData(this.filter);
        this.hideFilter();
    }

    cancel() {
        this.hideFilter()
    }

    showFilter() {
        this.sdService.dimScreen();
        this.filterShown = true;;
    }

    hideFilter() {
        this.sdService.undimScreen();
        this.filterShown = false;
    }
}

export interface filter  {
    shakemap?: boolean;
    facilities?: boolean;
    latMax?:  number;
    latMin?: number;
    lonMax?: number;
    lonMin?: number;
    groupAffected?: string;
}