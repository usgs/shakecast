import { Component,
         OnInit,
         OnDestroy } from '@angular/core';

import { NotificationService } from './notification.service';
import { EarthquakeService } from '../../earthquakes/earthquake.service';

@Component({
  selector: 'notification-dash',
  templateUrl: './notification-dash.component.html',
  styleUrls: ['./notification-dash.component.css',
                '../../../../shared/css/data-list.css']
})
export class NotificationDashComponent implements OnInit, OnDestroy {

    public notifications: any = [];
    public newEventGroups: string = ''
    public inspGroups: string = ''
    private subscriptions: any[] = [];
    constructor(private notService: NotificationService,
                private eqService: EarthquakeService) {}

    ngOnInit() {
        this.subscriptions.push(this.eqService.selectEvent.subscribe((event: any) => {
            this.onEvent(event);
        }));

        this.subscriptions.push(this.notService.notifications.subscribe(nots => {
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
        for (var not in nots) {
            if (nots[not]['notification_type'] == 'NEW_EVENT') {
                if (this.newEventGroups === '') {
                    this.newEventGroups += nots[not]['group_name']
                } else {
                    this.newEventGroups += ', ' + nots[not]['group_name']
                }
            } else {
                if (this.inspGroups === '') {
                    this.inspGroups += nots[not]['group_name']
                } else {
                    this.inspGroups += ', ' + nots[not]['group_name']
                }
            }
        }
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