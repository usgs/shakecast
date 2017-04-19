import { Component, 
         OnInit,
         trigger,
         state,
         style,
         transition,
         animate } from '@angular/core';
import { FacilityService, Facility } from '../facility.service'
import { ScreenDimmerService } from '../../../../shared/screen-dimmer/screen-dimmer.service'

@Component({
    selector: 'facility-filter',
    templateUrl: 'app/shakecast-admin/pages/facilities/facility-filter/facility-filter.component.html',
    styleUrls: ['app/shakecast-admin/pages/facilities/facility-filter/facility-filter.component.css']
})
export class FacilityFilter {
    public filter: filter = {}

    constructor(private facService: FacilityService,
                private sdService: ScreenDimmerService) {}

    selectAll() {
        this.facService.selectAll();
    }

    unselectAll() {
        this.facService.unselectAll();
    }

    deleteFacs() {
        this.facService.deleteFacs();
    }

    search() {
        this.facService.getData(this.filter);
        this.hideFilter();
    }

    cancelFilter() {
        this.hideFilter()
    }

    showFilter() {
        this.sdService.dimScreen();
    }

    hideFilter() {
        this.sdService.undimScreen();
    }
}

export interface filter  {
    latMax?:  number;
    latMin?: number;
    lonMax?: number;
    lonMin?: number;
    groupAffected?: string;
    keywords?: string
}