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
    public selectedFacs: any = []
    public filter: filter = {}
    private subscriptions: any[] = []
    constructor(private facService: FacilityService) {}

    ngOnInit() {
        this.subscriptions.push(this.facService.facilityData.subscribe(facs => {
            this.facilityData = facs
            for (var fac in this.facilityData) {
                this.facilityData[fac].selected = false;
            }

            if (this.selectedFacs.length === 0) {
                // add a facility if the array is empty
                this.selectedFacs.push(this.facilityData[0]);
                this.facilityData[0].selected = true;
            }

            this.plotFac(this.facilityData[0])
        }));

        this.facService.getData(this.filter);
    }
    
    clickFac(fac: Facility) {
        fac.selected = !fac.selected;

        if (fac.selected) {
            // add it to the list
            this.selectedFacs.push(fac)
            this.plotFac(fac)
        } else {
            // remove it from the list
            var index: number = this.selectedFacs.indexOf('shakecast_id', fac.shakecast_id)
            this.selectedFacs.splice(index, 1)
            this.removeFac(fac)
        }
    }

    removeFac(fac: Facility) {
        this.facService.removeFac(fac);
    }

    plotFac(fac: Facility) {
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