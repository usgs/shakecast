import { Component } from 'angular2/core';
import { ROUTER_DIRECTIVES } from 'angular2/router';


@Component({
  selector: 'nav-bar',
  templateUrl: 'app/nav/nav.component.html',
  directives: [ROUTER_DIRECTIVES]
})
export class NavComponent {
}