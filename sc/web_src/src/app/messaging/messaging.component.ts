import { Component, ViewEncapsulation, OnInit, OnDestroy } from '@angular/core';
import { NotificationsService } from 'angular2-notifications';
import { MessagesService } from '../shared/messages.service';
import { timer } from 'rxjs';
import { Router } from '@angular/router';
import { CookieService } from '../shared/cookie.service';

@Component({
  selector: 'messaging',
  template: '',
})
export class MessagingComponent implements OnInit, OnDestroy {

    subscriptions: any[] = [];
    messageTime = 0;

    constructor(private notService: NotificationsService,
                private messService: MessagesService,
                private cookieService: CookieService,
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
            let maxTime = 0;
            let messageTime = +this.cookieService.getCookie('messageTime');

            if (isNaN(messageTime)) {
                messageTime = 0;
            }

            for (const messTime of messages) {
                const numTime = +messTime;
                if (numTime > messageTime) {
                    // Print message
                    this.makeNotification(messages[messTime]);
                    if (numTime > maxTime) {
                        maxTime = numTime;
                    }
                }
            }

            if (maxTime > 0) {
                this.cookieService.setCookie('messageTime', maxTime.toString())
            }
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

    ngOnDestroy() {
        this.endSubscriptions();
    }

    endSubscriptions() {
        for (const sub of this.subscriptions) {
            this.subscriptions[sub].unsubscribe();
        }
    }
}
