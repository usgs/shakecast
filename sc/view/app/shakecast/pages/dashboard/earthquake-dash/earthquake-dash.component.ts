import { Component,
         OnInit,
         OnDestroy } from '@angular/core';

import { EarthquakeService, Earthquake } from 'app/shakecast/pages/earthquakes/earthquake.service.ts';

@Component({
  selector: 'earthquake-dash',
  templateUrl: 'app/shakecast/pages/dashboard/earthquake-dash/earthquake-dash.component.html',
  styleUrls: ['app/shakecast/pages/dashboard/earthquake-dash/earthquake-dash.component.css']
})
export class EarthquakeDashComponent implements OnInit, OnDestroy {

    public earthquakeData: any = [];
    public pulledRight: boolean = false

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
        this.endSubscriptions()
    }

    endSubscriptions() {
        for (var sub in this.subscriptions) {
            this.subscriptions[sub].unsubscribe()
        }
    }
}