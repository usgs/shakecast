import { Component, 
         OnInit, 
         OnDestroy,
         trigger,
         state,
         style,
         transition,
         animate } from '@angular/core';
import { EarthquakeService, Earthquake } from './earthquake.service'

import { filter } from './earthquake-filter/earthquake-filter.component'

@Component({
    selector: 'earthquake-list',
    templateUrl: 'app/shakecast/pages/earthquakes/earthquake-list.component.html',
    styleUrls: ['app/shakecast/pages/earthquakes/earthquake-list.component.css'],
    animations: [
      trigger('pulledRight', [
        state('false', style({transform: 'translateX(0)'})),
        state('true', style({transform: 'translateX(100%)'})),
        transition('false => true', [
            animate('500ms ease-in-out', style({
                transform: 'translateX(100%)'
            }))
            ]
        ),
        transition('true => false', [
            animate('500ms ease-in-out', style({
                transform: 'translateX(0%)'
            }))
            ]
        )
      ])
    ]
})
export class EarthquakeListComponent implements OnInit, OnDestroy {
    public earthquakeData: any = [];
    public pulledRight: boolean = false;
    public dataLoading: boolean = false;

    public filter: filter = {
        shakemap: false,
        facilities: false
    }
    private subscriptions: any[] = []
    constructor(private eqService: EarthquakeService) {}

    ngOnInit() {
        //this.getEqs()
        this.subscriptions.push(this.eqService.earthquakeData.subscribe(eqs => {
            this.earthquakeData = eqs
            this.plotEq(eqs[0])
        }));

        this.subscriptions.push(this.eqService.dataLoading.subscribe(loading => {
            this.dataLoading = loading
        }));

        this.eqService.getData(this.filter);
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