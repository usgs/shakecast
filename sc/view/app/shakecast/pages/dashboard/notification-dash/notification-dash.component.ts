import { Component,
         OnInit,
         OnDestroy } from '@angular/core';

import { NotificationService } from './notification.service'

@Component({
  selector: 'notification-dash',
  templateUrl: 'app/shakecast/pages/dashboard/notification-dash/notification-dash.component.html',
  styleUrls: ['app/shakecast/pages/dashboard/notification-dash/notification-dash.component.css']
})
export class NotificationDashComponent implements OnInit, OnDestroy {

    public notifications: any = [];
    private subscriptions: any[] = [];
    constructor(private notService: NotificationService) {}

    ngOnInit() {
        this.subscriptions.push(this.notService.notifications.subscribe(nots => {
            this.notifications = nots;
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