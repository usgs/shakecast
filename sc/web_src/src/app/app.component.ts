import { Component, ViewEncapsulation, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from './login/user.service';
import { Observable } from 'rxjs/Observable';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class AppComponent implements OnInit, OnDestroy {
    public options = {
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
                this.userService.loggedIn = data.success
                this.userService.isAdmin = data.isAdmin;
                this.router.navigate(['/shakecast']);
            }
        }));
    }

    ngOnDestroy() {
        this.endSubscriptions()
    }

    endSubscriptions() {
        for (var sub in this.subscriptions) {
            this.subscriptions[sub].unsubscribe()
        }
    }
}
