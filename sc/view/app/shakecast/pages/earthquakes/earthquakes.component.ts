import { Component,
         OnInit,
         OnDestroy } from '@angular/core';
import { TitleService } from '../../../title/title.service';
import { EarthquakeService } from './earthquake.service.ts';

@Component({
    selector: 'earthquakes',
    templateUrl: 'app/shakecast/pages/earthquakes/earthquakes.component.html',
    styleUrls: ['app/shakecast/pages/earthquakes/earthquakes.component.css',
                  'app/shared/css/data-list.css']
})
export class EarthquakesComponent implements OnInit, OnDestroy {
    subscriptions: any[] = [];

    constructor(private titleService: TitleService,
                private eqService: EarthquakeService) {}

    ngOnInit() {
        this.titleService.title.next('Earthquakes');
        //this.getEqs()
        this.subscriptions.push(this.eqService.earthquakeData.subscribe(eqs => {
            this.eqService.plotEq(eqs[0])
        }));
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