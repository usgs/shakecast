import { Component, onInit } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationsService } from 'angular2-notifications'

import { UserService, User } from './user.service'

@Component({
    selector: 'login',
    templateUrl: 'app/login/login.component.html',
    styleUrls: ['app/login/login.component.css']
})
export class LoginComponent implements onInit {
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