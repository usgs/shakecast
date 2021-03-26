import { Component,
         OnInit,
         OnDestroy } from '@angular/core';
import { TitleService } from '@core/title.service';
import { EarthquakeService } from '@core/earthquake.service';
import { FacilityService } from '@core/facility.service';

import { PanelService } from '@core/panel.service';

@Component({
    selector: 'scenarios',
    templateUrl: './scenarios.component.html',
    styleUrls: ['./scenarios.component.css']
})
export class ScenariosComponent implements OnInit, OnDestroy {
    subscriptions: any[] = [];
    searchShown: boolean = false;

    constructor(private titleService: TitleService,
                public eqService: EarthquakeService,
                private panelService: PanelService) {}

    ngOnInit() {
        this.titleService.title.next('Scenarios');

        this.subscriptions.push(this.eqService.showScenarioSearch.subscribe((show: boolean) => {
            this.searchShown = show;
        }));

        this.subscriptions.push(this.eqService.earthquakeData.subscribe(eqs => {
            this.onEqData(eqs);
        }));

        this.eqService.getData({'scenario': true});
    }

    onEqData(eqs) {
        if ( (!eqs) || (!eqs.features) || (eqs.features.length === 0)) {
            return null;
        }

        this.eqService.selectEvent.next(eqs.features[0]);
    }

    getMore() {
        this.eqService.earthquakeData.next(null);
        this.searchShown = true;
        this.panelService.controlLeft.next('shown')
    }

    userScenarios() {
        this.eqService.showScenarioSearch.next(false);
        this.eqService.getData({'scenario': true});
        this.searchShown = false;
        this.panelService.controlLeft.next('hidden')
    }

    deleteScenario() {
        this.eqService.deleteScenario(this.eqService.selected.properties.event_id);
    }

    ngOnDestroy() {
        this.endSubscriptions();
        this.eqService.selectEvent.next(null);
        this.eqService.earthquakeData.next(null);
    }

    endSubscriptions() {
        for (const sub of this.subscriptions) {
            sub.unsubscribe();
        }
    }
}
