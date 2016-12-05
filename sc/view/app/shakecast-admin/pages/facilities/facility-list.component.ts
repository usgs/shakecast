import { Component,
         OnInit, 
         OnDestroy,
         trigger,
         state,
         style,
         transition,
         animate } from '@angular/core';
import { FacilityService, Facility } from './facility.service'

import { filter } from './facility-filter/facility-filter.component'

@Component({
  selector: 'facility-list',
  templateUrl: 'app/shakecast-admin/pages/facilities/facility-list.component.html',
  styleUrls: ['app/shakecast-admin/pages/facilities/facility-list.component.css'],
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
export class FacilityListComponent implements OnInit, OnDestroy {
    public facilityData: any = [];
    public pulledRight: boolean = false

    public filter: filter = {}
    private subscriptions: any[] = []
    constructor(private facService: FacilityService) {}

    ngOnInit() {
        //this.getEqs()
        this.subscriptions.push(this.facService.facilityData.subscribe(eqs => {
            this.facilityData = eqs
            this.plotFac(eqs[0])
        }));

        this.facService.getData(this.filter);
    }
    
    plotFac(fac: Facility) {
        this.facService.plotFac(fac)
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