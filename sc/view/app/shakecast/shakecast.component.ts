import { Component, 
         HostBinding} from '@angular/core';
import { fadeAnimation }   from '../shared/animations/animations';

@Component({
    selector: 'shakecast',
    templateUrl: 'app/shakecast/shakecast.component.html',
    animations: [ fadeAnimation ]
})
export class ShakeCastComponent {
    @HostBinding('@routeAnimation') routeAnimation = true;
    @HostBinding('style.display')   display = 'block';
    @HostBinding('style.position')  position = 'static';
}