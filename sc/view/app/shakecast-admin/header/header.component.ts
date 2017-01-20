import { Component, 
         ElementRef, 
         Input, 
         Renderer, 
         onInit,  
         trigger,
         state,
         style,
         transition,
         animate } from '@angular/core';

import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'my-header',
  templateUrl: 'app/shakecast/header/header.component.html',
  styleUrls: ['app/shakecast/header/header.component.css'],    
  animations: [
      trigger('scrollChange', [
        state('false', style({top: 0})),
        state('true', style({top: "-55px"})),
          transition('true => false', animate('100ms ease-in')),
          transition('false => true', animate('100ms ease-out'))
      ])
    ]
})
export class HeaderComponent implements onInit {
    public scrollUp: boolean = false;
    public scrolled: number = document.querySelector('body').scrollTop;
    private ignoreTime: number = 0;
    private hovering: boolean = false;

    conscructor() {}

    ngOnInit() {
        Observable.interval(500)
            .subscribe(x => {
                if (!this.hovering) {
                    this.ignoreTime += .5;
                    if (this.scrolled !== document.querySelector('body').scrollTop) {
                        if (this.scrolled > (document.querySelector('body').scrollTop) || 
                            (document.querySelector('body').scrollTop===0)) {
                            // show the element
                            if (this.scrollUp === true) {
                                console.log('scroll up');
                                this.scrollUp = false;
                                this.ignoreTime = 0;
                            }
                        } else if (this.scrolled < document.querySelector('body').scrollTop) {
                            // hide the element
                            if (this.scrollUp === false) {
                                console.log('scroll down');
                                this.scrollUp = true;
                            }
                        }

                        this.scrolled = document.querySelector('body').scrollTop
                    }
                    
                    console.log(this.scrolled)

                    // hide the header after 5 seconds of ignoreTime 
                    // unless at the top of the page
                    if ((this.ignoreTime > 5) && (document.querySelector('body').scrollTop!==0)) {
                        this.scrollUp = true;
                    }
                }
            });
    }

    setHover(boolIn: boolean) {
        this.hovering = boolIn
        if (this.hovering) {
            this.scrollUp = false
            this.ignoreTime = 0
        }
    }
    
}