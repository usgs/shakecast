import { Component,
         OnInit,
         OnDestroy } from '@angular/core';

import { NotificationService } from './notification.service'

@Component({
  selector: 'notification-dash',
  templateUrl: 'app/shakecast/pages/dashboard/notification-dash/notification-dash.component.html',
  styleUrls: ['app/shakecast/pages/dashboard/notification-dash/notification-dash.component.css',
                'app/shared/css/data-list.css']
})
export class NotificationDashComponent implements OnInit, OnDestroy {

    public notifications: any = [];
    public newEventGroups: string = ''
    public inspGroups: string = ''
    private subscriptions: any[] = [];
    constructor(private notService: NotificationService) {}

    ngOnInit() {
        this.subscriptions.push(this.notService.notifications.subscribe(nots => {
            this.notifications = nots;
            this.inspGroups = '';
            this.newEventGroups = '';
            for (var not in nots) {
                if (nots[not]['notification_type'] == 'NEW_EVENT') {
                    if (this.newEventGroups === '') {
                        this.newEventGroups += nots[not]['group_name']
                    } else {
                        this.newEventGroups += ',' + nots[not]['group_name']
                    }
                } else {
                    if (this.inspGroups === '') {
                        this.inspGroups += nots[not]['group_name']
                    } else {
                        this.inspGroups += ',' + nots[not]['group_name']
                    }
                }
            }
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