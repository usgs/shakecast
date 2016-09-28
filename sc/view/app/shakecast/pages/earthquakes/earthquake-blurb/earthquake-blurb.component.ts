import { Component, Input } from '@angular/core';
import { EarthquakeService, Earthquake } from '../earthquake.service'

@Component({
    selector: 'earthquake-blurb',
    templateUrl: 'app/shakecast/pages/earthquakes/earthquake-blurb.component.html',
    styleUrls: ['app/shakecast/pages/earthquakes/earthquake-blurb.component.css']
})
export class EarthquakeBlurbComponent {
    @Input() eq: Earthquake    
}