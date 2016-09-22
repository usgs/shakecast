import { Directive, 
         ElementRef, 
         Input, 
         Renderer, 
         onInit } from '@angular/core';

import { Observable } from 'rxjs/Observable';

@Directive({
    selector: '[stickToTop]',
    host: {'[class.stick-to-top]':'stuck',
            '(window:scroll)': 'checkLock($event)'}
})

export class StickToTopDirective implements onInit {
    private scrolled: number = document.querySelector('body').scrollTop
    public stuck: boolean = false

    constructor(private el:ElementRef) {}

    checkLock(event: any) {
        this.scrolled = document.querySelector('body').scrollTop
                console.log(this.scrolled)
                console.log(this.el.nativeElement.offsetTop)
                console.log(this.el.nativeElement)
                if (this.scrolled >= this.el.nativeElement.parentElement.offsetTop) {
                    if (this.stuck !== true) {
                        console.log('Stick it')
                    }
                    this.stuck = true
                } else {
                    if (this.stuck !== false) {
                        console.log('Unstick it')
                    }
                    this.stuck = false
                }
    }
}