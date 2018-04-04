import { Component} from '@angular/core';
import { EarthquakeService, Earthquake } from '../earthquake.service'

@Component({
    selector: 'eq-filter',
    templateUrl: './earthquake-filter.component.html',
    styleUrls: ['./earthquake-filter.component.css'],  
})
export class EarthquakeFilter {

    constructor(public eqService: EarthquakeService) {}

}