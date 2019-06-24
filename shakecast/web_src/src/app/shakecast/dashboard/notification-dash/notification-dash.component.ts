import { Component,
         OnInit,
         OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { NotificationService } from '@core/notification.service';
import { EarthquakeService } from '@core/earthquake.service';

@Component({
  selector: 'notification-dash',
  templateUrl: './notification-dash.component.html',
  styleUrls: ['./notification-dash.component.css',
                '../../../shared/css/data-list.css']
})
export class NotificationDashComponent implements OnInit, OnDestroy {

    public notifications: any = [];
    public newEventGroups = '';
    public inspGroups = '';
    private subscriptions = new Subscription;
    constructor(private notService: NotificationService,
                private eqService: EarthquakeService) {}

    ngOnInit() {
        this.subscriptions.add(this.eqService.selectEvent.subscribe((event: any) => {
            this.onEvent(event);
        }));

        this.subscriptions.add(this.notService.notifications.subscribe(nots => {
            this.onNotifications(nots);
        }));
    }


    onEvent(event) {
        if (event == null) {
            this.newEventGroups = '';
            this.inspGroups = '';
            this.notifications = [];

            return;
        }

        this.notService.getNotifications(event);
    }

    onNotifications(nots) {
        this.inspGroups = '';
        this.newEventGroups = '';

        if (nots == null) {
            this.notifications = [];
            return;
        }

        this.notifications = nots;
        for (const not of nots) {
            if (not['notification_type'] === 'NEW_EVENT') {
                if (this.newEventGroups === '') {
                    this.newEventGroups += not['group_name'];
                } else {
                    this.newEventGroups += ', ' + not['group_name'];
                }
            } else {
                if (this.inspGroups === '') {
                    this.inspGroups += not['group_name'];
                } else {
                    this.inspGroups += ', ' + not['group_name'];
                }
            }
        }
    }

    ngOnDestroy() {
        this.endSubscriptions();
    }

    endSubscriptions() {
        this.subscriptions.unsubscribe();
    }
}