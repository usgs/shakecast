import { Component, 
         OnInit,
         OnDestroy,
         trigger,
         state,
         style,
         transition,
         animate } from '@angular/core';

import { EarthquakeService, Earthquake } from '../../../../shakecast/pages/earthquakes/earthquake.service';

@Component({
    selector: 'scenario-search',
    templateUrl: 'app/shakecast-admin/pages/scenarios/scenario-search/scenario-search.component.html',
    styleUrls: ['app/shakecast-admin/pages/scenarios/scenario-search/scenario-search.component.css'],  
    animations: [
      trigger('show', [
        state('false', style({left: '100%'})),
        state('true', style({left: '55%'})),
          transition('true => false', animate('500ms ease-out')),
          transition('false => true', animate('500ms ease-in'))
      ])
    ]
})
export class ScenarioSearchComponent implements OnInit, OnDestroy{
    private subscriptions: any[] = [];
    private show: boolean = false;
    public facilityShaking: any = null;
    public showFragilityInfo: boolean = false;
    public filter: any = {starttime: '2005-01-01',
                          endtime: null,
                          minmagnitude: 6,
                          minlatitude: -90,
                          maxlatitude: 90,
                          minlongitude: -180,
                          maxlongitude: 180}

    constructor(private eqService: EarthquakeService) {}

    ngOnInit() {
        this.subscriptions.push(this.eqService.showScenarioSearch.subscribe((show: any) => {
            this.show = true;
        }));
    }

    showInfo() {

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
