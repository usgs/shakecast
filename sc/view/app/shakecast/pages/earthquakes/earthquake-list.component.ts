import { Component, onInit } from '@angular/core';
import { EarthquakeService, Earthquake } from './earthquake.service'

@Component({
    selector: 'earthquake-list',
    templateUrl: 'app/shakecast/pages/earthquakes/earthquakes-list.component.html'
})
export class EarthquakeListComponent implements onInit {
    public earthquakeData: Earthquake[] = [];
    constructor(private eqService: EarthquakeService) {}

    ngOnInit() {
        this.eqService.getData().subscribe((result) => {
            this.earthquakeData = result.data
            console.log(this.earthquakeData)
        });
    }
    
}