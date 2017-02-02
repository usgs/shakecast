import { Component, 
         OnInit,
         OnDestroy,
         trigger,
         state,
         style,
         transition,
         animate } from '@angular/core';
import { FacilityService, Facility } from '../facility.service';
import { Router } from '@angular/router';

@Component({
    selector: 'facility-info',
    templateUrl: 'app/shakecast-admin/pages/facilities/facility-info/facility-info.component.html',
    styleUrls: ['app/shakecast-admin/pages/facilities/facility-info/facility-info.component.css'],  
    animations: [
      trigger('show', [
        state('false', style({left: '100%'})),
        state('true', style({left: '55%'})),
          transition('true => false', animate('500ms ease-out')),
          transition('false => true', animate('500ms ease-in'))
      ])
    ]
})
export class FacilityInfoComponent implements OnInit, OnDestroy{
    private subscriptions: any[] = [];
    private show: boolean = false;
    public facility: Facility = null;

    constructor(private facService: FacilityService,
                public _router: Router) {}

    ngOnInit() {
        this.subscriptions.push(this.facService.showInfo.subscribe((facility: Facility) => {
            if (facility) {
                this.show = true;
                this.facility = facility;
            } else {
                this.show = false;
            }
        }));

        this.subscriptions.push(this.facService.facilityInfo.subscribe((facility: Facility) => {
            this.facility = facility;
        }));
    }

    hide() {
        this.show = false;
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
