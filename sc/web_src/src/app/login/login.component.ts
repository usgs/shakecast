import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationsService } from 'angular2-notifications'

import { UserService, User } from './user.service'

@Component({
    selector: 'login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent {
    constructor(private userService: UserService, 
                private router: Router,
                private notService: NotificationsService) {}

    user = new User('', '')

    onSubmit(username, password) {
        this.userService.login(username, password).subscribe((result) => {
            if (result.success) {
                this.router.navigate(['/shakecast']);
                this.notService.success('Login', 
                            'Welcome, ' + this.userService.username);
            } else {
                this.notService.error('Login Failed', 'Invalid Username or Password')
            }
        });
    }
}