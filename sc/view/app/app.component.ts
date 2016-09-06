import {Component, ViewEncapsulation} from 'angular2/core';
import {RouteConfig, ROUTER_DIRECTIVES, ROUTER_PROVIDERS} from 'angular2/router';
import { HTTP_PROVIDERS } from 'angular2/http';

import {HeaderComponent} from './header/header.component'
import {NavComponent} from './nav/nav.component'

import {DashboardComponent} from './pages/dashboard/dashboard.component'
import {EarthquakesComponent} from './pages/earthquakes/earthquakes.component'
import {LoginComponent} from './login/login.component'

import {UserService} from './login/user.service'

@Component({
  selector: 'app',
  templateUrl: 'app/app.component.html',
  styleUrls: ['app/main.css'],
  encapsulation: ViewEncapsulation.None,
  directives: [HeaderComponent, NavComponent, DashboardComponent, 
              EarthquakesComponent, LoginComponent, ROUTER_DIRECTIVES],
  providers: [UserService, ROUTER_PROVIDERS, HTTP_PROVIDERS]
})
@RouteConfig([
  {path: '/dashboard', name: 'Dashboard', component: DashboardComponent, useAsDefault: true},
  {path: '/earthquakes', name: 'Earthquakes', component: EarthquakesComponent},
  {path: '/login', name: 'Login', component: LoginComponent}
])
export class AppComponent {
}

