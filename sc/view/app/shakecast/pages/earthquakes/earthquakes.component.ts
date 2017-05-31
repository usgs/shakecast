import { Component,
         OnInit,
         OnDestroy } from '@angular/core';
import { TitleService } from '../../../title/title.service';
import { EarthquakeService } from './earthquake.service.ts';

import { showLeft, showRight, showBottom } from '../../../shared/animations/animations';

@Component({
    selector: 'earthquakes',
    templateUrl: 'app/shakecast/pages/earthquakes/earthquakes.component.html',
    styleUrls: ['app/shakecast/pages/earthquakes/earthquakes.component.css',
                  'app/shared/css/data-list.css',
                  'app/shared/css/panels.css'],
    animations: [showLeft, showRight, showBottom]
})
export class EarthquakesComponent implements OnInit, OnDestroy {
    subscriptions: any[] = [];
    earthquakeData: any[] = [];
    showLeft: string = 'hidden';
    showRight: string = 'shown';
    showBottom: string = 'hidden';
    
    constructor(private titleService: TitleService,
                private eqService: EarthquakeService) {}

    ngOnInit() {
        this.titleService.title.next('Earthquakes');
        //this.getEqs()
        this.subscriptions.push(this.eqService.earthquakeData.subscribe(eqs => {
            this.earthquakeData = eqs
            this.eqService.plotEq(eqs[0])
        }));
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
        this.endSubscriptions()
    }

    endSubscriptions() {
        for (var sub in this.subscriptions) {
            this.subscriptions[sub].unsubscribe()
        }
    }
}