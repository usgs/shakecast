import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { showRight } from '../../animations/animations'

import { Subscription } from 'rxjs/subscription';
import { PanelService } from '../panel.service';

@Component({
  selector: 'panels-right-panel',
  templateUrl: './right-panel.component.html',
  styleUrls: ['./right-panel.component.css',
                '../../../shared/css/panels.css'],
  animations: [ showRight ]
})
export class RightPanelComponent implements OnInit, OnDestroy {
  public show: string = 'shown';
  private subs = new Subscription();
  
  constructor(private controlService: PanelService) {}
  @Input() title: string;
  @Input() open = false;
  @Input() control = true;

  ngOnInit() {
    this.subs.add(this.controlService.controlBottom.subscribe(command => {
      if (command) {
        this.show = command;
      }
    }));

    if (this.open) {
      this.show = 'shown'
    } else {
      this.show = 'hidden'
    }
  }

  toggle() {
    if (this.show == 'hidden') {
        this.show = 'shown';
    } else {
        this.show = 'hidden'
    }
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

}
