import { Component, OnInit, Input } from '@angular/core';
import { showRight } from '../../animations/animations'

@Component({
  selector: 'panels-right-panel',
  templateUrl: './right-panel.component.html',
  styleUrls: ['./right-panel.component.css',
                '../../../shared/css/panels.css'],
  animations: [ showRight ]
})
export class RightPanelComponent implements OnInit {
  public showRight: string = 'shown';

  constructor() { }
  @Input() title: string;

  ngOnInit() {
  }

  toggleRight() {
    if (this.showRight == 'hidden') {
        this.showRight = 'shown';
    } else {
        this.showRight = 'hidden'
    }
  }

}
