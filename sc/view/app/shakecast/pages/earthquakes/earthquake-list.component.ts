import { Component, onInit } from '@angular/core';
import { EarthquakeService, Earthquake } from './earthquake.service'

@Component({
    selector: 'earthquake-list',
    templateUrl: 'app/shakecast/pages/earthquakes/earthquake-list.component.html',
    styleUrls: ['app/shakecast/pages/earthquakes/earthquake-list.component.css']
})
export class EarthquakeListComponent implements onInit {
    public earthquakeData: Earthquake[] = [];
    constructor(private eqService: EarthquakeService) {}

    ngOnInit() {
        this.eqService.getData().subscribe((result: any) => {
            this.earthquakeData = result.data
            console.log(this.earthquakeData)
        });
    }

    plotEq(eq: Earthquake) {
        this.eqService.plotEq(eq)
    }
    
}