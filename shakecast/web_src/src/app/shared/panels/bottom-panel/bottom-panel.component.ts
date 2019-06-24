import { Component, OnInit, Input, OnDestroy } from '@angular/core';

import { Subscription } from 'rxjs';

import { showBottom } from '@shared/animations/animations';
import { PanelService } from '@core/panel.service';

@Component({
  selector: 'panels-bottom-panel',
  templateUrl: './bottom-panel.component.html',
  styleUrls: ['./bottom-panel.component.css',
                '../../../shared/css/panels.css'],
  animations: [ showBottom ]
})
export class BottomPanelComponent implements OnInit, OnDestroy {
  public show = 'hidden';
  private subs = new Subscription();

  constructor(private controlService: PanelService) { }
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