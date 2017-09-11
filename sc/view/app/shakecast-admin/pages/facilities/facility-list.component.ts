import { Component,
         OnInit,
         ElementRef, 
         OnDestroy } from '@angular/core';

import { Observable } from 'rxjs/Observable';

import { trigger,
         state,
         style,
         animate,
         transition } from '@angular/animations';

import { Router } from '@angular/router';
import { FacilityService, Facility } from './facility.service';
import { filter } from './facility-filter/facility-filter.component';
declare var _: any;

@Component({
  selector: 'facility-list',
  host: {'(window:scroll)': 'setScrollEvent($event)'},
  templateUrl: 'app/shakecast-admin/pages/facilities/facility-list.component.html',
  styleUrls: ['app/shakecast-admin/pages/facilities/facility-list.component.css',
                'app/shared/css/data-list.css'],
  animations: [
      trigger('selected', [
        state('yes', style({transform: 'translateY(-10px)'})),
        state('no', style({transform: 'translateY(0px)'})),
          transition('* => *', animate('100ms ease-in-out'))
      ]),
      trigger('headerSelected', [
        state('yes', style({'background-color': '#7af'})),
        state('no', style({'background-color': '*'}))
      ])
    ]
})
export class FacilityListComponent implements OnInit, OnDestroy {
    public loadingData: boolean = false
    public shownFacilityData: any = [];
    public facilityData: any = [];
    public lastShownFacIndex: number = 0;
    public selectedFacs: any = [];
    public filter: filter = {};
    public initPlot: boolean = false;
    private didScroll: boolean = false;
    private subscriptions: any[] = [];
    constructor(public facService: FacilityService,
                private element: ElementRef,
                private _router: Router) {}

    ngOnInit() {
        this.subscriptions.push(this.facService.facilityData.subscribe(facs => {
            this.facilityData = facs;

            // only display the first 50 facs
            this.shownFacilityData = this.facilityData;

            if (this.selectedFacs.length === 0) {
                // add a facility if the array is empty
                this.facService.selectedFacs = this.selectedFacs;
                this.facService.hideFacInfo();
            }

            if ((this.facilityData.length > 0) && (this._router.url === '/shakecast-admin/facilities')) {
                if (!this.selectedFacs) {
                    this.selectedFacs.push(this.facilityData[0]);
                    this.facService.selectedFacs.push(this.facilityData[0]);
                }

                this.facService.setFacInfo(this.facilityData[0]);
                this.facilityData[0].selected = 'yes';
            }
        }));

        this.subscriptions.push(this.facService.facilityDataUpdate.subscribe((facs: any) => {
            this.facilityData = this.facilityData.concat(facs);
            this.shownFacilityData = this.facilityData;
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

    }
    
    checkScroll() {
        console.log('check scroll position')
    }

    setScrollEvent(e: Event) {
        this.didScroll = true;
    }

    clickFac(fac: Facility) {
        if (fac.selected === 'yes') {
            fac.selected = 'no'
        } else {
            fac.selected = 'yes'
        }

        if (fac.selected === 'yes') {
            // add it to the list
            this.facService.setFacInfo(fac);
            this.selectedFacs.push(fac);
            this.plotFac(fac);
        } else {
            // remove it from the list
            var index: number = _.findIndex(this.selectedFacs,{shakecast_id: fac.shakecast_id});
            this.selectedFacs.splice(index, 1);
            this.removeFac(fac);
        }

        this.facService.selectedFacs = this.selectedFacs;
    }

    plotByIndex(index: number) {
        if (this.facilityData[index]) {
            this.clickFac(this.facilityData[index]);
        } else {
            this.initPlot = true;
        }
    }

    selectAll() {
        this.unselectAll();
        for (var facID in this.facilityData) {
            var fac: Facility = this.facilityData[facID];
            fac.selected = 'yes';
            this.selectedFacs.push(fac);
            this.plotFac(fac);
        }
    }

    unselectAll() {
        for (var facID in this.selectedFacs) {
            var fac: Facility = this.selectedFacs[facID];
            fac.selected = 'no';
            this.removeFac(fac);
        }
        this.selectedFacs = [];
        this.facService.selectedFacs = [];
    }

    removeFac(fac: Facility) {
        this.facService.removeFac(fac);
    }

    plotFac(fac: Facility) {
        this.facService.plotFac(fac);
    }

    loadMore() {
        this.filter['count'] = this.facilityData.length;
        this.facService.updateData(this.filter);
    }

    ngOnDestroy() {
        this.endSubscriptions();
    }

    endSubscriptions() {
        for (var sub in this.subscriptions) {
            this.subscriptions[sub].unsubscribe();
        }
    }
    
}