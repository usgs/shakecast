import { Component,
         OnInit,
         OnDestroy } from '@angular/core';
import { TitleService } from '../../../title/title.service';
import { EarthquakeService, Earthquake } from '../../../shakecast/pages/earthquakes/earthquake.service';
import { FacilityService } from '../facilities/facility.service';

import { PanelService } from '../../../shared/panels/panel.service';

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
                private facService: FacilityService,
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
        if ( (!eqs) || (eqs == null) || (eqs.length === 0)) {
            return;
        }

        this.eqService.selectEvent.next(eqs[0]);
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
        this.eqService.deleteScenario(this.eqService.selected.event_id);
    }

    ngOnDestroy() {
        this.endSubscriptions();
        this.eqService.selectEvent.next(null);
        this.eqService.earthquakeData.next(null);
    }

    endSubscriptions() {
        for (var sub in this.subscriptions) {
            this.subscriptions[sub].unsubscribe();
        }

    }
    
}