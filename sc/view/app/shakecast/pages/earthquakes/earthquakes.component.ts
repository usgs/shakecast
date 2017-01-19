import { Component,
         OnInit } from '@angular/core';
import { TitleService } from '../../../title/title.service';

@Component({
    selector: 'earthquakes',
    templateUrl: 'app/shakecast/pages/earthquakes/earthquakes.component.html',
    styleUrls: ['app/shakecast/pages/earthquakes/earthquakes.component.css']
})
export class EarthquakesComponent implements OnInit {
    constructor(private titleService: TitleService) {}

    ngOnInit() {
        this.titleService.title.next('Earthquakes');
    }
    
}