import { Component, OnInit } from '@angular/core';

import { NotificationHTMLService } from '../notification.service';

@Component({
  selector: 'notifications-facilities',
  templateUrl: './facilities.component.html',
  styleUrls: ['./facilities.component.css', '../configs.css']
})
export class FacilitiesComponent implements OnInit {

  constructor(public notService: NotificationHTMLService) { }

  ngOnInit() {
  }

}
