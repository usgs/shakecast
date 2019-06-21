import { Component, Input } from '@angular/core';

@Component({
    selector: 'earthquake-blurb',
    templateUrl: './earthquake-blurb.component.html',
    styleUrls: ['./earthquake-blurb.component.css']
})
export class EarthquakeBlurbComponent {
    @Input() eq: any
}