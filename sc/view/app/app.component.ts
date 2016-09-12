import { Component, ViewEncapsulation, onInit } from '@angular/core';
import { Router } from '@angular/router'
import { UserService } from './login/user.service'

@Component({
  selector: 'my-app',
  templateUrl: 'app/app.component.html',
  styleUrls: ['app/main.css'],
  encapsulation: ViewEncapsulation.None,
})
export class AppComponent implements onInit {

    constructor(private userService: UserService,
                private router: Router) {}

    ngOnInit() {
        // Skip to dashboard if user already logged in
        this.userService.checkLoggedIn().subscribe( ((data) => {
            if (data.success === true) {
                this.router.navigate(['/shakecast'])
            }
        }));
    }

}