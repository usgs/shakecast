import { Component,
         OnInit } from '@angular/core';

import { timer } from 'rxjs';

import { navAnimation } from '../shared/animations/animations';

import { Router } from '@angular/router';
import { UserService } from '@core/user.service';
import { NotificationsService } from 'angular2-notifications';

@Component({
  selector: 'navbar',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css'],
  animations: [ navAnimation ]
})
export class NavComponent implements OnInit {
    public scrollUp = 'down';
    public scrolled: number = document.querySelector('body').scrollTop;
    private ignoreTime = 0;
    private hovering = false;

    constructor(public userService: UserService,
                private notService: NotificationsService,
                public router: Router) {}

    ngOnInit() {
        timer(0, 1000)
            .subscribe(x => {
                if (!this.hovering) {
                    this.ignoreTime += .5;
                    if (this.scrolled !== document.scrollingElement.scrollTop) {
                        if (this.scrolled > (document.scrollingElement.scrollTop) || 
                            (document.scrollingElement.scrollTop===0)) {
                            // show the element
                            if (this.scrollUp === 'up') {
                                console.log('scroll up');
                                this.scrollUp = 'down';
                                this.ignoreTime = 0;
                            }
                        } else if (this.scrolled < document.scrollingElement.scrollTop) {
                            // hide the element
                            if (this.scrollUp === 'down') {
                                console.log('scroll down');
                                this.scrollUp = 'up';
                            }
                        }

                        this.scrolled = document.scrollingElement.scrollTop;
                    }

                    // hide the header after 5 seconds of ignoreTime
                    // unless at the top of the page
                    if ((this.ignoreTime > 5) && (document.scrollingElement.scrollTop !== 0)) {
                        this.scrollUp = 'up';
                    }
                }
            });
    }

    setHover(boolIn: boolean) {
        this.hovering = boolIn;
        if (this.hovering) {
            this.scrollUp = 'down';
            this.ignoreTime = 0;
        }
    }

    changeRoute(url: string) {
        this.router.navigate([url]);
    }

    logout() {
        this.userService.logout();
        this.notService.success('Logout', 'success');
    }
}
