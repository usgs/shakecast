import { Component, ViewEncapsulation, onInit } from '@angular/core';
import { Router } from '@angular/router'
import { UserService } from './login/user.service'
import { NotificationsService } from 'angular2-notifications'

@Component({
  selector: 'my-app',
  templateUrl: 'app/app.component.html',
  styleUrls: ['app/main.css'],
  encapsulation: ViewEncapsulation.None,
})
export class AppComponent implements onInit {
    public options = {
        timeOut: 2000,
        lastOnBottom: true,
        clickToClose: true,
        maxLength: 0,
        maxStack: 7,
        showProgressBar: false,
        pauseOnHover: true
    };

    constructor(private userService: UserService,
                private router: Router,
                private notService: NotificationsService) {}

    ngOnInit() {
        // Skip to dashboard if user already logged in
        this.userService.checkLoggedIn().subscribe( ((data) => {
            if (data.loggedIn === true) {
                this.userService.isAdmin = data.isAdmin
                this.router.navigate(['/shakecast'])
            }
        }));
    }
}