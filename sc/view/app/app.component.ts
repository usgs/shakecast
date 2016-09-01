import {Component, ViewEncapsulation} from 'angular2/core';
import {RouteConfig, ROUTER_DIRECTIVES, ROUTER_PROVIDERS} from 'angular2/router';

import {HeaderComponent} from './header/header.component'

@Component({
  selector: 'app',
  templateUrl: 'app/app.component.html',
  styleUrls: ['app/main.css'],
  encapsulation: ViewEncapsulation.None,
  directives: [HeaderComponent, ROUTER_DIRECTIVES],
  providers: [ROUTER_PROVIDERS]
})
export class AppComponent {
}

