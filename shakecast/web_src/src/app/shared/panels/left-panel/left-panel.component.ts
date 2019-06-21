import { Component, OnInit, OnDestroy, Input } from '@angular/core';

import { Subscription } from 'rxjs';

import { showLeft } from '@shared/animations/animations';
import { PanelService } from '@core/panel.service';

@Component({
  selector: 'panels-left-panel',
  templateUrl: './left-panel.component.html',
  styleUrls: ['./left-panel.component.css',
                '../../../shared/css/panels.css'],
  animations: [ showLeft ]
})
export class LeftPanelComponent implements OnInit, OnDestroy {
  public show = 'hidden';
  public subs = new Subscription();

  constructor(private controlService: PanelService) {}
  @Input() title: string;
  @Input() open = false;
  @Input() control = true;

  ngOnInit() {
    this.subs.add(this.controlService.controlLeft.subscribe(command => {
      if (command) {
        this.show = command;
      }
    }));

    if (this.open) {
      this.show = 'shown';
    } else {
      this.show = 'hidden';
    }
  }

  toggle() {
    if (this.show === 'hidden') {
        this.show = 'shown';
    } else {
        this.show = 'hidden';
    }
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

}
