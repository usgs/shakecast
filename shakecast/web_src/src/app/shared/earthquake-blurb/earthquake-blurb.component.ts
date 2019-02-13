import { Component, Input } from '@angular/core';
import { Earthquake } from '../../shakecast/pages/earthquakes/earthquake.service'

@Component({
    selector: 'earthquake-blurb',
    templateUrl: './earthquake-blurb.component.html',
    styleUrls: ['./earthquake-blurb.component.css']
})
export class EarthquakeBlurbComponent {
    @Input() eq: any
}