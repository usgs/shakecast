import { Component, OnInit, OnDestroy } from '@angular/core';
import { EarthquakeService, Earthquake } from './earthquake.service'

@Component({
    selector: 'earthquake-list',
    templateUrl: 'app/shakecast/pages/earthquakes/earthquake-list.component.html',
    styleUrls: ['app/shakecast/pages/earthquakes/earthquake-list.component.css']
})
export class EarthquakeListComponent implements OnInit, OnDestroy {
    public earthquakeData: any = [];
    public filter: any = {};
    private subscriptions: any[] = []
    constructor(private eqService: EarthquakeService) {}

    ngOnInit() {
        //this.getEqs()
        this.subscriptions.push(this.eqService.earthquakeData.subscribe(eqs => {
            this.earthquakeData = eqs
            this.plotEq(eqs[0])
        }));

        this.eqService.getData();
    }

    plotEq(eq: Earthquake) {
        this.eqService.plotEq(eq)
    }

    ngOnDestroy() {
        for (var sub in this.subscriptions) {
            this.subscriptions[sub].unsubscribe()
        }
    }
    
}