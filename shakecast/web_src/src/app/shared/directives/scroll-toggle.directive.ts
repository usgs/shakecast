import { Directive,
         ElementRef,
         OnInit } from '@angular/core';

import { timer } from "rxjs";

@Directive({
    selector: '[scroll-toggle]',
})

export class ScrollToggleDirective implements OnInit {
    private scrolled = document.querySelector('body').scrollTop;
    public scrollUp = false;

    constructor(private el: ElementRef) {}

    ngOnInit() {
        console.log('Scroll Directive')
        timer(0, 500)
            .subscribe(x => {
                if (this.scrolled !== document.querySelector('body').scrollTop) {
                    if (this.scrolled > (document.querySelector('body').scrollTop + 100)) {
                        // show the element
                        if (this.scrollUp === true) {
                            console.log('Show element');
                            this.scrollUp = false;
                        }
                    } else if (this.scrolled < document.querySelector('body').scrollTop) {
                        // hide the element
                        if (this.scrollUp === false) {
                            console.log('hide element');
                            console.log(this.el);
                            this.scrollUp = true;
                        }
                    }

                    this.scrolled = document.querySelector('body').scrollTop;
                }

                console.log(this.scrolled);
            });
    }
}
