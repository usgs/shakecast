import { Component,
         OnInit } from '@angular/core';
import { TitleService } from '../../../title/title.service';
import { EarthquakeService, Earthquake } from '../../../shakecast/pages/earthquakes/earthquake.service';

@Component({
    selector: 'scenarios',
    templateUrl: 'app/shakecast-admin/pages/scenarios/scenarios.component.html',
    styleUrls: ['app/shakecast-admin/pages/scenarios/scenarios.component.css',
                  'app/shared/css/data-list.css']
})
export class ScenariosComponent implements OnInit {
    subscriptions: any[] = [];

    constructor(private titleService: TitleService,
                public eqService: EarthquakeService) {}

    ngOnInit() {
        this.titleService.title.next('Scenarios');
        this.subscriptions.push(this.eqService.earthquakeData.subscribe(eqs => {
            this.eqService.plotEq(eqs[0])
        }));

        this.eqService.getData({'scenario': true});
    }

    
}