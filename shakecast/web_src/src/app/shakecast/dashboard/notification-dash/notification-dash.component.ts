import { Component,
         Input,
         OnChanges,
         OnInit} from '@angular/core';

import { NotificationService } from '@core/notification.service';

@Component({
  selector: 'notification-dash',
  templateUrl: './notification-dash.component.html',
  styleUrls: ['./notification-dash.component.css',
                '../../../shared/css/data-list.css']
})
export class NotificationDashComponent implements OnChanges {
    @Input() event = null;
    constructor(public notService: NotificationService) {}

    ngOnChanges() {
      if (this.event) {
        this.notService.getNotifications(this.event);
      }
    }
}
