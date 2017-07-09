import { Component} from '@angular/core';
import { EarthquakeService, Earthquake } from '../earthquake.service'

@Component({
    selector: 'eq-filter',
    templateUrl: 'app/shakecast/pages/earthquakes/earthquake-filter/earthquake-filter.component.html',
    styleUrls: ['app/shakecast/pages/earthquakes/earthquake-filter/earthquake-filter.component.css'],  
})
export class EarthquakeFilter {

    constructor(public eqService: EarthquakeService) {}

}