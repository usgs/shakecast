import { Component } from '@angular/core';
import { fadeAnimation } from '@shared/animations/animations';

@Component({
    selector: 'shakecast',
    templateUrl: './shakecast.component.html',
    animations: [ fadeAnimation ]
})
export class ShakeCastComponent {

}
