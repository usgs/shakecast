import { Component } from '@angular/core';
import { UserService } from '../../login/user.service'

@Component({
  selector: 'nav-bar',
  templateUrl: 'app/shakecast/nav/nav.component.html'
})
export class NavComponent {
  constructor(private userService: UserService) {}

  logout() {
    this.userService.logout()
  }
}