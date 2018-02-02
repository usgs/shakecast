import { Component, 
         ElementRef, 
         Input, 
         Renderer, 
         OnInit } from '@angular/core';


import { trigger,
         state,
         style,
         animate,
         transition } from '@angular/animations';

import { navAnimation }   from '../shared/animations/animations';

import { Router } from '@angular/router';

import { Observable } from 'rxjs/Observable';
import { UserService } from '../login/user.service'
import { NotificationsService } from 'angular2-notifications'

@Component({
  selector: 'navbar',
  templateUrl: 'app/nav/nav.component.html',
  styleUrls: ['app/nav/nav.component.css'],    
  animations: [ navAnimation ]
})
export class NavComponent implements OnInit {
    public scrollUp: string = 'down';
    public scrolled: number = document.querySelector('body').scrollTop;
    private ignoreTime: number = 0;
    private hovering: boolean = false;

    constructor(private userService: UserService,
                private notService: NotificationsService,
                private router: Router) {}

    ngOnInit() {
        Observable.interval(500)
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

                        this.scrolled = document.scrollingElement.scrollTop
                    }
                    
                    console.log(this.scrolled)

                    // hide the header after 5 seconds of ignoreTime 
                    // unless at the top of the page
                    if ((this.ignoreTime > 5) && (document.scrollingElement.scrollTop!==0)) {
                        this.scrollUp = 'up';
                    }
                }
            });
    }

    setHover(boolIn: boolean) {
        this.hovering = boolIn
        if (this.hovering) {
            this.scrollUp = 'down'
            this.ignoreTime = 0
        }
    }  

    changeRoute(url: string) {
        this.router.navigate([url]);
    }
    
    logout() {
        this.userService.logout()
        this.notService.success('Logout', 'success')
    }
    
}