import { Component,
         OnInit,
         OnDestroy } from '@angular/core';
import { TitleService } from '../../../title/title.service';
import { EarthquakeService, Earthquake } from '../../../shakecast/pages/earthquakes/earthquake.service';
import { FacilityService } from '../facilities/facility.service';

import { showLeft, showRight, showBottom } from '../../../shared/animations/animations';

@Component({
    selector: 'scenarios',
    templateUrl: 'app/shakecast-admin/pages/scenarios/scenarios.component.html',
    styleUrls: ['app/shakecast-admin/pages/scenarios/scenarios.component.css',
                  'app/shared/css/data-list.css',
                  'app/shared/css/panels.css'],
    animations: [ showLeft, showRight, showBottom ]
})
export class ScenariosComponent implements OnInit, OnDestroy {
    subscriptions: any[] = [];
    searchShown: boolean = false;

    public showBottom: string = 'hidden';
    public showLeft: string = 'hidden';
    public showRight: string = 'hidden';

    constructor(private titleService: TitleService,
                public eqService: EarthquakeService,
                private facService: FacilityService) {}

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

        this.toggleBottom();
        this.toggleRight();
    }

    getMore() {
        this.eqService.showScenarioSearch.next(true);
        this.eqService.earthquakeData.next([]);
        this.showLeft = 'shown'
    }

    userScenarios() {
        this.eqService.showScenarioSearch.next(false);
        this.eqService.getData({'scenario': true});
        this.showLeft = 'hidden';
    }

    deleteScenario() {
        this.eqService.deleteScenario(this.eqService.selected.event_id);
    }

  toggleLeft() {
      if (this.showLeft == 'hidden') {
          this.showLeft = 'shown';
      } else {
          this.showLeft = 'hidden'
      }
  }

  toggleRight() {
      if (this.showRight == 'hidden') {
          this.showRight = 'shown';
      } else {
          this.showRight = 'hidden'
      }
  }

  toggleBottom() {
      if (this.showBottom == 'hidden') {
          this.showBottom = 'shown';
      } else {
          this.showBottom = 'hidden'
      }
  }

    ngOnDestroy() {
        this.endSubscriptions();

        // clear map
        this.eqService.clearData();
    }

    endSubscriptions() {
        for (var sub in this.subscriptions) {
            this.subscriptions[sub].unsubscribe();
        }
    }
    
}