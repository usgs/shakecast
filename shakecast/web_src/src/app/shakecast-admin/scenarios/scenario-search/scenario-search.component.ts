import { Component,
         OnInit,
         OnDestroy } from '@angular/core';
import { trigger,
         state,
         style,
         transition,
         animate } from '@angular/animations';

import { EarthquakeService } from '@core/earthquake.service';

@Component({
    selector: 'scenario-search',
    templateUrl: './scenario-search.component.html',
    styleUrls: ['./scenario-search.component.css'],
    animations: [
      trigger('show', [
        state('hide', style({left: '100%'})),
        state('show', style({left: '55%'})),
          transition('* => *', animate('500ms ease-in-out'))
      ])
    ]
})
export class ScenarioSearchComponent implements OnInit, OnDestroy{
    private subscriptions: any[] = [];
    private show = 'hide';
    public facilityShaking: any = null;
    public showFragilityInfo = false;
    public lats: number[] = [];
    public lons: number[] = [];
    public filter: any = {starttime: '2005-01-01',
                          endtime: '',
                          eventid: null,
                          minmagnitude: 7,
                          minlatitude: -90,
                          maxlatitude: 90,
                          minlongitude: -180,
                          maxlongitude: 180,
                          scenariosOnly: false};

    constructor(public eqService: EarthquakeService) {
        const date = new Date();
        let day: any = date.getDate();
        let month: any = date.getMonth();

        if (day < 10) {
            day = '0' + day;
        }
        if (month < 10) {
            month = '0' + month;
        }

        this.filter['endtime'] = [date.getFullYear(),
                                    month, day].join('-');
    }

    ngOnInit() {

        // generate lats and lons
        for (let i = -180; i <= 180; i += 5) {
            this.lons.push(i);
            if ((i >= -90) && (i <= 90)) {
                this.lats.push(i);
            }
        }

        this.subscriptions.push(this.eqService.showScenarioSearch.subscribe((show: boolean) => {
            if (show === true) {
                this.show = 'show';
            } else {
                this.show = 'hide';
            }
        }));
    }

    showInfo() {

    }

    hide() {
        this.show = 'hide';
    }

    ngOnDestroy() {
        this.endSubscriptions();
    }

    endSubscriptions() {
        for (const sub of this.subscriptions) {
            sub.unsubscribe();
        }
    }
}
