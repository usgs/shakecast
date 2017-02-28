import { Component, ViewEncapsulation, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from './login/user.service';
import { NotificationsService } from 'angular2-notifications';
import { MessagesService } from './shared/messages.service';
import { Observable } from 'rxjs/Observable';
import { CookieService } from 'angular2-cookie';

@Component({
  selector: 'my-app',
  templateUrl: 'app/app.component.html',
  styleUrls: ['app/main.css'],
  encapsulation: ViewEncapsulation.None,
})
export class AppComponent implements OnInit, OnDestroy {
    public options = {
        timeOut: 4000,
        lastOnBottom: true,
        clickToClose: true,
        maxLength: 0,
        maxStack: 7,
        showProgressBar: false,
        pauseOnHover: true
    };
    subscriptions: any[] = [];
    messageTime: number = 0;

    constructor(private userService: UserService,
                private router: Router,
                private notService: NotificationsService,
                private messService: MessagesService,
                private cookieService: CookieService
                ) {}

    ngOnInit() {
        // Skip to dashboard if user already logged in
        this.subscriptions.push(this.userService.checkLoggedIn().subscribe( ((data: any) => {
            if (data.loggedIn === true) {
                this.userService.isAdmin = data.isAdmin;
                this.router.navigate(['/shakecast']);
            }
        })));


        this.subscriptions.push(
            Observable.interval(30000).subscribe(data => {
                    this.messService.getMessages();
                }
            )
        );

        this.subscriptions.push(this.messService.messages.subscribe((messages: any) => {
            var maxTime = 0;
            var messageTime = parseInt(this.cookieService.get('messageTime'));

            if (isNaN(messageTime)) {
                messageTime = 0;
            }

            for (let messTime in messages) {
                let numTime = parseInt(messTime);
                if (numTime > this.messageTime) {
                    // Print message
                    this.makeNotification(messages[messTime]);
                    if (numTime > maxTime) {
                        maxTime = numTime;
                    }
                }
            }

            if (maxTime > 0) {
                this.messageTime = maxTime;
                this.cookieService.put('messageTime', maxTime.toString())
            }
        }));
    }

    makeNotification(message: any) {
        if (message['title'] && message['message']) {
            if (message['status'] == 'success') {
                this.notService.success(message['title'],
                                        message['message'], {timeOut: 0});
            } else if (message['status'] == 'failed') {
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