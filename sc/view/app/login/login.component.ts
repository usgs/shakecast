import { Component } from 'angular2/core';
import { Router } from 'angular2/router';

import { UserService } from './user.service';
import { User } from './user'

@Component({
  selector: 'login',
  templateUrl: 'app/login/login.component.html'
})
export class LoginComponent {
  constructor(private userService: UserService, private router: Router) {}
  
  user = new User('', '')

  onSubmit(username, password) {
    this.userService.login(username, password).subscribe((result) => {
      if (result) {
        this.router.navigate(['Dashboard']);
      }
    });
  }
}