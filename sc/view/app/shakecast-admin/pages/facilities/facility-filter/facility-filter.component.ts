import { Component, 
         OnInit,
         trigger,
         state,
         style,
         transition,
         animate } from '@angular/core';
import { FacilityService, Facility } from '../facility.service'
import { ScreenDimmerService } from '../../../../shared/screen-dimmer/screen-dimmer.service'
import { NotificationsService } from 'angular2-notifications'

@Component({
    selector: 'facility-filter',
    templateUrl: 'app/shakecast-admin/pages/facilities/facility-filter/facility-filter.component.html',
    styleUrls: ['app/shakecast-admin/pages/facilities/facility-filter/facility-filter.component.css'],  
    animations: [
      trigger('filterShown', [
        state('false', style({bottom: '-150px'})),
        state('true', style({bottom: '200px'})),
          transition('true => false', animate('100ms ease-out')),
          transition('false => true', animate('100ms ease-in'))
      ])
    ]
})
export class FacilityFilter {
    public filterShown = false;

    public filter: filter = {}
    public options = {
        timeOut: 0,
        lastOnBottom: true,
        clickToClose: true,
        maxLength: 0,
        maxStack: 7,
        showProgressBar: false,
        pauseOnHover: true
    };
    constructor(private facService: FacilityService,
                private sdService: ScreenDimmerService) {}

    search() {
        this.facService.getData(this.filter);
        this.hideFilter();
    }

    cancelFilter() {
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
    latMax?:  number;
    latMin?: number;
    lonMax?: number;
    lonMin?: number;
    groupAffected?: string;
}