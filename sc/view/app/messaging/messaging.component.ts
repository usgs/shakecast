import { Component, ViewEncapsulation, OnInit, OnDestroy } from '@angular/core';
import { NotificationsService } from 'angular2-notifications';
import { MessagesService } from '../shared/messages.service';
import { Observable } from 'rxjs/Observable';
import { Router } from '@angular/router';
import { CookieService } from '../shared/cookie.service';

@Component({
  selector: 'messaging',
  template: '',
})
export class MessagingComponent implements OnInit, OnDestroy {

    subscriptions: any[] = [];
    messageTime: number = 0;

    constructor(private notService: NotificationsService,
                private messService: MessagesService,
                private cookieService: CookieService,
                private _router: Router
                ) {}

    ngOnInit() {
        this.subscriptions.push(
            Observable.interval(10000).subscribe(data => {
                    if (this._router.url != '/login') {
                        this.messService.getMessages();
                    }
                }
            )
        );

        this.subscriptions.push(this.messService.messages.subscribe((messages: any) => {
            var maxTime = 0;
            var messageTime = parseInt(this.cookieService.getCookie('messageTime'));

            if (isNaN(messageTime)) {
                messageTime = 0;
            }

            for (let messTime in messages) {
                let numTime = parseInt(messTime);
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
        this.endSubscriptions()
    }

    endSubscriptions() {
        for (var sub in this.subscriptions) {
            this.subscriptions[sub].unsubscribe()
        }
    }
    
}