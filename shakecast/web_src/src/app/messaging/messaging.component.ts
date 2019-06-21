import { Component, OnInit, OnDestroy } from '@angular/core';
import { NotificationsService } from 'angular2-notifications';
import { MessagesService } from '@core/messages.service';
import { timer } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'messaging',
  template: '',
})
export class MessagingComponent implements OnInit, OnDestroy {

    subscriptions: any[] = [];
    messageTime: number = (new Date()).getTime() / 1000;

    constructor(private notService: NotificationsService,
                private messService: MessagesService,
                private _router: Router
                ) {}

    ngOnInit() {
        this.subscriptions.push(
            timer(0, 10000)
            .subscribe(data => {
                    if (this._router.url !== '/login') {
                        this.messService.getMessages();
                    }
                }
            )
        );

        this.subscriptions.push(this.messService.messages.subscribe((messages: any) => {
            this.onNotification(messages);
        }));
    }

    makeNotification(message: any) {
        if (message['title'] && message['message']) {
            if (message['success'] === true) {
                this.notService.success(message['title'],
                                        message['message'], {timeOut: 0});
            } else if (message['success'] === false) {
                this.notService.error(message['title'],
                                        message['message'], {timeOut: 0});
            } else {
                this.notService.info(message['title'],
                                        message['message'], {timeOut: 0});
            }
        }
    }

    onNotification(messages) {
        for (const key of Object.keys(messages)) {
            const messTime = parseFloat(key);
            if (messTime > this.messageTime) {
                // Print message
                this.makeNotification(messages[messTime]);
                this.messageTime = messTime;
            }
        }
    }

    ngOnDestroy() {
        this.endSubscriptions();
    }

    endSubscriptions() {
        for (const sub of this.subscriptions) {
            this.subscriptions[sub].unsubscribe();
        }
    }
}
