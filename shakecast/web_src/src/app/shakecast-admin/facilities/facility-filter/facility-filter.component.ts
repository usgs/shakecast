import { Component, HostListener} from '@angular/core';
import { FacilityService } from '@core/facility.service';

@Component({
    selector: 'facility-filter',
    templateUrl: './facility-filter.component.html',
    styleUrls: ['./facility-filter.component.css']
})
export class FacilityFilter {
    public filter: filter = {
      limit: 50
    };

    constructor(public facService: FacilityService) {}

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

export interface filter {
    latMax?:  number;
    latMin?: number;
    lonMax?: number;
    lonMin?: number;
    groupAffected?: string;
    keywords?: string;
    limit?: number;
}
