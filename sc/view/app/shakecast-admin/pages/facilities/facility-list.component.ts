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
      ]),
      trigger('headerSelected', [
        state('true', style({'background-color': '#7af'})),
        state('false', style({'background-color': '#aaaaaa'})),
          transition('true => false', animate('100ms ease-out')),
          transition('false => true', animate('100ms ease-in'))
      ])

    ]
})
export class FacilityListComponent implements OnInit, OnDestroy {
    public loadingData: boolean = false
    public facilityData: any = [];
    public selectedFacs: any = [];
    public filter: filter = {};
    private subscriptions: any[] = [];
    constructor(private facService: FacilityService) {}

    ngOnInit() {
        this.subscriptions.push(this.facService.facilityData.subscribe(facs => {
            
            // clear fac markers from the map
            for (var fac in this.selectedFacs) {
                this.removeFac(this.selectedFacs[fac])
            }

            this.facilityData = facs;
            for (var fac in this.facilityData) {
                this.facilityData[fac].selected = false;
            }

            if (this.selectedFacs.length === 0) {
                // add a facility if the array is empty
                this.facService.selectedFacs = this.selectedFacs;
                this.facService.hideFacInfo();
            }

            if (this.facilityData.length > 0) {
                this.selectedFacs.push(this.facilityData[0]);
                this.facilityData[0].selected = true;
                this.plotFac(this.facilityData[0]);
            }
        }));

        this.subscriptions.push(this.facService.selection.subscribe(select => {
            if (select === 'all') {
                this.selectAll();
            } else if (select === 'none') {
                this.unselectAll();
            } else if (select === 'delete') {
            }

            this.facService.selectedFacs = this.selectedFacs;
        }));

        this.subscriptions.push(this.facService.loadingData.subscribe((loading: boolean) => {
            this.loadingData = loading
        }));

        //this.facService.getData(this.filter);
    }
    
    clickFac(fac: Facility) {
        fac.selected = !fac.selected;

        if (fac.selected) {
            // add it to the list
            this.selectedFacs.push(fac);
            this.plotFac(fac);
        } else {
            // remove it from the list
            var index: number = this.selectedFacs.indexOf('shakecast_id', fac.shakecast_id);
            this.selectedFacs.splice(index, 1);
            this.removeFac(fac);
        }

        this.facService.selectedFacs = this.selectedFacs;
    }

    selectAll() {
        for (facID in this.selectedFacs) {
            fac = this.selectedFacs[facID];
            this.removeFac(fac);
        }
        this.selectedFacs = [];
        for (var facID in this.facilityData) {
            var fac: Facility = this.facilityData[facID];
            fac.selected = true;
            this.selectedFacs.push(fac);
            this.plotFac(fac);
        }
    }

    unselectAll() {
        for (var facID in this.selectedFacs) {
            var fac: Facility = this.selectedFacs[facID];
            fac.selected = false;
            this.removeFac(fac);
        }
        this.selectedFacs = [];
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
            this.subscriptions[sub].unsubscribe();
        }
    }
    
}