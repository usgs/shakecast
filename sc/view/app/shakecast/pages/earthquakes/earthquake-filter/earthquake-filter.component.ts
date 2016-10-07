import { Component, OnInit } from '@angular/core';
import { EarthquakeService, Earthquake } from '../earthquake.service'

@Component({
    selector: 'eq-filter',
    templateUrl: 'app/shakecast/pages/earthquakes/earthquake-filter/earthquake-filter.component.html',
    styleUrls: ['app/shakecast/pages/earthquakes/earthquake-filter/earthquake-filter.component.css']
})
export class EarthquakeFilter {
    public filter: filter = {
        shakemap: true,
        facilities: false
    }
    constructor(private eqService: EarthquakeService) {}

    search() {
        this.eqService.getData(this.filter);
    }
}

interface filter  {
    shakemap?: boolean;
    facilities?: boolean;
    latMax?:  number;
    latMin?: number;
    lonMax?: number;
    lonMin?: number;
    groupAffected?: string;
}