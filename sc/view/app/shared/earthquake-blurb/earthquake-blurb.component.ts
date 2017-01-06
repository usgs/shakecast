import { Component, Input } from '@angular/core';
import { Earthquake } from '../../shakecast/pages/earthquakes/earthquake.service'

@Component({
    selector: 'earthquake-blurb',
    templateUrl: 'app/shared/earthquake-blurb/earthquake-blurb.component.html',
    styleUrls: ['app/shared/earthquake-blurb/earthquake-blurb.component.css']
})
export class EarthquakeBlurbComponent {
    @Input() eq: any
}