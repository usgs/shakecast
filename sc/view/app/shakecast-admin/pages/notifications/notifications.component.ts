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
    public config: any = {}

    @ViewChild('notificationContainer') notContainer: ElementRef;

    ngOnInit() {
        this.titleService.title.next('Notifications')

        this.subscriptions.push(this.notHTMLService.notification.subscribe((html: string) => {
                this.notContainer.nativeElement.innerHTML = html;
            })
        );
        this.subscriptions.push(this.notHTMLService.config.subscribe((config: any) => {
                this.config = config
            })
        );

        this.notHTMLService.getNewEvent('default');
        this.notHTMLService.getConfigs('new_event', 'default')
    }
}