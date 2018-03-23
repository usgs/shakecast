import { Component, OnInit, Input } from '@angular/core';
import { showBottom } from '../../animations/animations'

@Component({
  selector: 'panels-bottom-panel',
  templateUrl: './bottom-panel.component.html',
  styleUrls: ['./bottom-panel.component.css',
                '../../../shared/css/panels.css'],
  animations: [ showBottom ]
})
export class BottomPanelComponent implements OnInit {
  public showBottom = 'hidden';

  constructor() { }
  @Input() title: string;

  ngOnInit() {
  }

  toggleBottom() {
    if (this.showBottom == 'hidden') {
        this.showBottom = 'shown';
    } else {
        this.showBottom = 'hidden'
    }
  }

}