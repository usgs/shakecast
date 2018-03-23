import { Component, OnInit, Input } from '@angular/core';
import { showLeft } from '../../animations/animations'

@Component({
  selector: 'panels-left-panel',
  templateUrl: './left-panel.component.html',
  styleUrls: ['./left-panel.component.css',
                '../../../shared/css/panels.css'],
  animations: [ showLeft ]
})
export class LeftPanelComponent implements OnInit {
  public showLeft = 'hidden';
  
  constructor() { }
  @Input() title: string;

  ngOnInit() {
  }

  toggleLeft() {
    if (this.showLeft == 'hidden') {
        this.showLeft = 'shown';
    } else {
        this.showLeft = 'hidden'
    }
  }

}
