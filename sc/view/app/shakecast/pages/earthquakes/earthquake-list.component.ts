import { Component, OnInit } from '@angular/core';
import { EarthquakeService, Earthquake } from './earthquake.service'

@Component({
    selector: 'earthquake-list',
    templateUrl: 'app/shakecast/pages/earthquakes/earthquake-list.component.html',
    styleUrls: ['app/shakecast/pages/earthquakes/earthquake-list.component.css']
})
export class EarthquakeListComponent implements OnInit {
    public earthquakeData: Earthquake[] = [];
    public filter: any = {};
    constructor(private eqService: EarthquakeService) {}

    ngOnInit() {
        this.getEqs()
    }

    getEqs() {
        this.eqService.getData(this.filter).subscribe((result: any) => {
            this.earthquakeData = result.data
            this.plotEq(this.earthquakeData[0])
        });
    }

    plotEq(eq: Earthquake) {
        this.eqService.plotEq(eq)
    }
    
}