import { Component, OnInit } from '@angular/core';

import { NotificationHTMLService } from '../notification.service';

@Component({
  selector: 'notifications-new-event',
  templateUrl: './new-event.component.html',
  styleUrls: ['./new-event.component.css', '../configs.css']
})
export class NewEventComponent implements OnInit {

  constructor(public notService: NotificationHTMLService) { }

  ngOnInit() {
  }

}
