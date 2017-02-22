import { Component,
         OnInit,
         OnDestroy } from '@angular/core';
import { TitleService } from '../../../title/title.service';
import { EarthquakeService, Earthquake } from '../../../shakecast/pages/earthquakes/earthquake.service';

@Component({
    selector: 'scenarios',
    templateUrl: 'app/shakecast-admin/pages/scenarios/scenarios.component.html',
    styleUrls: ['app/shakecast-admin/pages/scenarios/scenarios.component.css',
                  'app/shared/css/data-list.css']
})
export class ScenariosComponent implements OnInit, OnDestroy {
    subscriptions: any[] = [];
    searchShown: boolean = false;
    constructor(private titleService: TitleService,
                public eqService: EarthquakeService) {}

    ngOnInit() {
        this.titleService.title.next('Scenarios');

        this.subscriptions.push(this.eqService.earthquakeData.subscribe(eqs => {
            this.eqService.plotEq(eqs[0])
        }));

        this.subscriptions.push(this.eqService.showScenarioSearch.subscribe((show: boolean) => {
            this.searchShown = show;
        }));

        this.eqService.getData({'scenario': true});
        this.eqService.showScenarioSearch.next(false);
    }

    getMore() {
        this.eqService.showScenarioSearch.next(true);
        this.eqService.earthquakeData.next([]);
    }

    userScenarios() {
        this.eqService.showScenarioSearch.next(false);
        this.eqService.getData({'scenario': true});
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