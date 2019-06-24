import { Directive,
         ElementRef,
         OnInit, OnDestroy } from '@angular/core';

import { timer } from 'rxjs';
import { StickToTopService } from '@core/stick-to-top.service';
import { Subscription } from 'rxjs';

@Directive({
    selector: '[stickToTop]',
    host: {'[class.stick-to-top]':'stuck',
            '[style.top.px]': 'stuckTop',
            '(window:scroll)': 'setDidScroll($event)'}
})
export class StickToTopDirective implements OnInit, OnDestroy {
    private scrolled: number = document.querySelector('body').scrollTop;
    public stuck = false;
    public stuckTop = 0;
    public top = 0;
    private height = 0;
    private init = true;
    private didScroll = false;
    private subs = new Subscription();

    constructor(private el: ElementRef,
                private sttService: StickToTopService) {
        this.top = el.nativeElement.offsetTop;
    }

    ngOnInit() {
        this.checkLock();
        this.subs.add(timer(0, 10)
                .subscribe(x => {
            if (this.didScroll) {
                this.didScroll = false;
                this.checkLock();
            }
        }));
    }

    setDidScroll(e: Event) {
        this.didScroll = true;
    }

    checkLock(event: Event = null) {
        if (this.init) {
            this.init = false;
            this.height = this.el.nativeElement.parentElement.offsetHeight;
        }
        this.scrolled = document.querySelector('body').scrollTop;
        if (this.stuck) {
            if (this.el.nativeElement.parentElement.getBoundingClientRect().top + this.height >= 
                    this.sttService.stackHeight) {

                this.stuckTop = this.top;
                this.sttService.stackHeight -= this.height;
                this.stuck = false;
            }
        } else if (this.sttService.stackHeight >=
                    this.el.nativeElement.parentElement.getBoundingClientRect().top) {
            if (!this.stuck) {

                this.stuckTop = this.sttService.stackHeight;
                this.sttService.stackHeight += this.height;
                this.stuck = true;
            }
        }
    }

    ngOnDestroy() {
        if (this.stuck) {
            this.sttService.stackHeight -= this.height;
        }

        this.subs.unsubscribe();
    }
}