import { Component,
         OnInit } from '@angular/core';
import { TitleService } from '../../../title/title.service';
import { EarthquakeService } from './earthquake.service.ts';

@Component({
    selector: 'earthquakes',
    templateUrl: 'app/shakecast/pages/earthquakes/earthquakes.component.html',
    styleUrls: ['app/shakecast/pages/earthquakes/earthquakes.component.css',
                  'app/shared/css/data-list.css']
})
export class EarthquakesComponent implements OnInit {
    constructor(private titleService: TitleService,
                private eqService: EarthquakeService) {}

    ngOnInit() {
        this.titleService.title.next('Earthquakes');
        this.eqService.getData({});
    }
    
}