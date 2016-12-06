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
      trigger('selected', [
        state('true', style({transform: 'translateY(-10px)'})),
        state('false', style({transform: 'translateY(0px)'})),
          transition('true => false', animate('100ms ease-out')),
          transition('false => true', animate('100ms ease-in'))
      ])

    ]
})
export class FacilityListComponent implements OnInit, OnDestroy {
    public facilityData: any = [];

    public filter: filter = {}
    private subscriptions: any[] = []
    constructor(private facService: FacilityService) {}

    ngOnInit() {
        this.subscriptions.push(this.facService.facilityData.subscribe(facs => {
            this.facilityData = facs
            for (var fac in this.facilityData) {
                this.facilityData[fac].selected = false;
            }
            this.plotFac(this.facilityData[0])
        }));

        this.facService.getData(this.filter);
    }
    
    plotFac(fac: Facility) {
        fac.selected = !fac.selected;
        this.facService.plotFac(fac);
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