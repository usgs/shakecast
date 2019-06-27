import { Component, ViewEncapsulation, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '@core/user.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class AppComponent implements OnInit, OnDestroy {
    options = {
        timeOut: 4000,
        lastOnBottom: true,
        clickToClose: true,
        maxLength: 0,
        maxStack: 7,
        showProgressBar: false,
        pauseOnHover: true
    };
    subscriptions: any[] = [];

    constructor(private userService: UserService,
                public router: Router
                ) {}

    ngOnInit() {
        // Skip to dashboard if user already logged in
        this.subscriptions.push(this.userService.checkLoggedIn().subscribe((data: any) => {
            if (data.loggedIn === true) {
                this.userService.loggedIn = data.success;
                this.userService.isAdmin = data.isAdmin;
            }
        }));
    }

    ngOnDestroy() {
        this.endSubscriptions();
    }

    endSubscriptions() {
        for (const sub of this.subscriptions) {
            this.subscriptions[sub].unsubscribe();
        }
    }
}
