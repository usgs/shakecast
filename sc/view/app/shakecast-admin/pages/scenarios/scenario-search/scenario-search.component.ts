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
                          maxlongitude: 180,
                          scenariosOnly: false}

    public lats: number[] = [];
    public lons: number[] = [];

    constructor(private eqService: EarthquakeService) {}

    ngOnInit() {

        // generate lats and lons
        for (var i = -180; i <= 180; i += 5) {
            this.lons.push(i);
            if ((i >= -90) && (i <=90)) {
                this.lats.push(i);
            }
        }

        this.subscriptions.push(this.eqService.showScenarioSearch.subscribe((show: boolean) => {
            this.show = show;
        }));
    }

    showInfo() {

    }

    hide() {
        this.show = false;
        //this.eqService.showScenarioSearch.next(false);
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
