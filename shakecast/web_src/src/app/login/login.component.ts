import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationsService } from 'angular2-notifications';

import { UserService, User } from '@core/user.service';

@Component({
    selector: 'login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent {
    constructor(private userService: UserService,
                private router: Router,
                private notService: NotificationsService) {}

    public user = new User('', '');

    onSubmit(username, password) {
        this.userService.login(username, password).subscribe((result: any) => {
            if (result.shakecast_id) {
                this.userService.user$.next(result);
                this.userService.loggedIn = true;
                this.userService.isAdmin = result.isAdmin;
                this.userService.username = username;

                this.router.navigate(['/shakecast']);
                this.notService.success('Login', 
                            'Welcome, ' + this.userService.username);
            } else {
                this.notService.error('Login Failed', 'Invalid Username or Password');

                this.userService.loggedIn = false;
                this.userService.isAdmin = false;
            }
        });
    }

    @HostListener('window:keydown', ['$event'])
    keyboardInput(event: any) {
        if (event.keyCode === 13) {
            this.onSubmit(this.user.username, this.user.password);
        }
    }
}