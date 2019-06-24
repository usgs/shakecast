import { Component, 
         OnInit,
         OnDestroy } from '@angular/core';

import { trigger,
         state,
         style,
         animate,
         transition } from '@angular/animations';

import { ScreenDimmerService } from '@core/screen-dimmer.service';

@Component({
    selector: 'screen-dimmer',
    template: '<div class="screen-dimmer" [@dimmerOn]="dimmerOn"></div>',
    styleUrls: ['./screen-dimmer.component.css'],
    animations: [
      trigger('dimmerOn', [
        state('no', style({opacity: 0, zIndex: -1})),
        state('yes', style({opacity: .6, zIndex: 999})),
          transition('* => *', animate('100ms ease-out'))
      ])
    ]
})
export class ScreenDimmerComponent implements OnInit, OnDestroy {
    private subscriptions: any = []
    public dimmerOn: string = 'no'
    constructor(private sdService: ScreenDimmerService) {}

    ngOnInit() {
        this.subscriptions.push(this.sdService.dim.subscribe(dim => {
            if (dim === true) {
                this.dimmerOn = 'yes'
            } else {
                this.dimmerOn = 'no'
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