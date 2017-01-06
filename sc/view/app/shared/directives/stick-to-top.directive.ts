import { Directive, 
         ElementRef, 
         OnInit, OnDestroy } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { StickToTopService } from './stick-to-top.service'

@Directive({
    selector: '[stickToTop]',
    host: {'[class.stick-to-top]':'stuck',
            '[style.top.px]': 'stuckTop',
            '(window:scroll)': 'checkLock($event)'}
})

export class StickToTopDirective implements OnInit, OnDestroy {
    private scrolled: number = document.querySelector('body').scrollTop;
    public stuck: boolean = false;
    public stuckTop: number = 0;
    public top: number = 0;
    private height: number = 0;
    private init: boolean = true
    constructor(private el:ElementRef,
                private sttService: StickToTopService) {
        this.top = el.nativeElement.offsetTop;
    }

    ngOnInit() {
        this.checkLock({})
    }

    checkLock(event: any) {
        if (this.init) {
            this.init = false
            this.height = this.el.nativeElement.parentElement.offsetHeight
        }
        this.scrolled = document.querySelector('body').scrollTop
        if (this.stuck === true) {
            if (this.el.nativeElement.parentElement.offsetTop + this.height >= 
                    this.scrolled + this.sttService.stackHeight) {
                //console.log('Unstick it')
                this.stuckTop = this.top
                this.sttService.stackHeight -= this.height
                this.stuck = false
            }
        } else if (this.scrolled >= 
                    (this.el.nativeElement.parentElement.offsetTop - this.sttService.stackHeight)) {
            if (this.stuck !== true) {
                //console.log('Stick it')
                this.stuckTop = this.sttService.stackHeight
                this.sttService.stackHeight += this.height
                this.stuck = true
            }
        }
    }

    ngOnDestroy() {
        if (this.stuck) {
            this.sttService.stackHeight -= this.height
        }
    }
}