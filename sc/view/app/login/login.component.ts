import { Component, onInit } from '@angular/core';
import { Router } from '@angular/router';

import { UserService, User } from './user.service'

@Component({
    selector: 'login',
    templateUrl: 'app/login/login.component.html'
})
export class LoginComponent implements onInit {
    constructor(private userService: UserService, private router: Router) {}
  
    ngOnInit() {
    }

    user = new User('', '')

    onSubmit(username, password) {
        this.userService.login(username, password).subscribe((result) => {
            if (result) {
                this.router.navigate(['/shakecast']);
            }
        });
    }
}