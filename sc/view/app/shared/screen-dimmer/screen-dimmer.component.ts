import { Component, 
         OnInit,
         OnDestroy,
         trigger,
         state,
         style,
         transition,
         animate } from '@angular/core';
import { ScreenDimmerService } from './screen-dimmer.service'

@Component({
    selector: 'screen-dimmer',
    template: '<div class="screen-dimmer" [@dimmerOn]="dimmerOn"></div>',
    styleUrls: ['app/shared/screen-dimmer/screen-dimmer.component.css'],  
    animations: [
      trigger('dimmerOn', [
        state('false', style({opacity: 0, zIndex: -1})),
        state('true', style({opacity: .6, zIndex: 999})),
          transition('true => false', animate('100ms ease-out')),
          transition('false => true', animate('100ms ease-in'))
      ])
    ]
})
export class ScreenDimmerComponent implements OnInit, OnDestroy {
    private subscriptions: any = []
    public dimmerOn: boolean = false
    constructor(private sdService: ScreenDimmerService) {}

    ngOnInit() {
        this.subscriptions.push(this.sdService.dim.subscribe(dim => {
            if (dim === true) {
                this.dimmerOn = true
            } else {
                this.dimmerOn = false
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