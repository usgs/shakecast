import { Component, HostListener} from '@angular/core';
import { FacilityService, Facility } from '../facility.service'
import { ScreenDimmerService } from '../../../../shared/screen-dimmer/screen-dimmer.service'

@Component({
    selector: 'facility-filter',
    templateUrl: './facility-filter.component.html',
    styleUrls: ['./facility-filter.component.css']
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
    }

    @HostListener('window:keydown', ['$event'])
    keyboardInput(event: any) {
        if (event.keyCode === 13) {
            this.facService.getData(this.filter);
        }
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