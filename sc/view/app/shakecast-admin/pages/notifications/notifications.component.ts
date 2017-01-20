import { Component,
         OnInit, 
         OnDestroy,
         trigger,
         state,
         style,
         transition,
         animate,
         ElementRef,
         ViewChild } from '@angular/core';
import { TitleService } from '../../../title/title.service';
import { NotificationHTMLService } from './notification.service'
@Component({
    selector: 'notifications',
    templateUrl: 'app/shakecast-admin/pages/notifications/notifications.component.html',
    styleUrls: ['app/shakecast-admin/pages/notifications/notifications.component.css']
})
export class NotificationsComponent implements OnInit {
    constructor(private titleService: TitleService,
                private notHTMLService: NotificationHTMLService) {}
    private subscriptions: any[] = [];
    public notification: string = '';
    public test:string = '<h1 style="color:red">TESTTTTT</h1>';

    @ViewChild('notificationContainer') notContainer: ElementRef;

    ngOnInit() {
        this.titleService.title.next('Notifications')

        this.subscriptions.push(this.notHTMLService.notification.subscribe((html: string) => {
                this.notContainer.nativeElement.innerHTML = html;
            }));

        this.notHTMLService.getNewEvent();
    }
}