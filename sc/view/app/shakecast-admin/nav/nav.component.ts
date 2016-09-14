import { Component } from '@angular/core';
import { UserService } from '../../login/user.service'
import { NotificationsService } from 'angular2-notifications'

@Component({
  selector: 'nav-bar',
  templateUrl: 'app/shakecast-admin/nav/nav.component.html'
})
export class NavComponent {
  constructor(private userService: UserService,
              private notService: NotificationsService) {}

  logout() {
    this.userService.logout()
    this.notService.success('Logout', 'success')
  }
}