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
import { NotificationsService } from 'angular2-notifications'
declare var _: any;

@Component({
    selector: 'notifications',
    templateUrl: 'app/shakecast-admin/pages/notifications/notifications.component.html',
    styleUrls: ['app/shakecast-admin/pages/notifications/notifications.component.css']
})
export class NotificationsComponent implements OnInit {
    private subscriptions: any[] = [];
    public notification: string = '';
    public name: string = 'default'
    public config: any = {}
    public oldConfig: any = {}

    // Variables to control page behavior
    public clicked: boolean = false;

    constructor(private titleService: TitleService,
                private notHTMLService: NotificationHTMLService,
                private notService: NotificationsService) {}

    @ViewChild('notificationContainer') notContainer: ElementRef;

    ngOnInit() {
        this.titleService.title.next('Notifications')

        this.subscriptions.push(this.notHTMLService.notification.subscribe((html: string) => {
                this.notContainer.nativeElement.innerHTML = html;
            })
        );
        this.subscriptions.push(this.notHTMLService.config.subscribe((config: any) => {
                this.config = config;
                this.oldConfig = JSON.parse(JSON.stringify(config));
            })
        );

        this.notHTMLService.getNewEvent(this.name);
        this.notHTMLService.getConfigs('new_event', 'default')
    }

    previewNewEvent() {
        this.notHTMLService.getNewEvent(this.name, this.config)
    }

    saveConfigs() {
        if (!_.isEqual(this.config,this.oldConfig)) {
            this.notHTMLService.saveConfigs(this.name,
                                        this.config)
            this.oldConfig = JSON.parse(JSON.stringify(this.config));
        } else {
            this.notService.info('No Changes', 'These configs are already in place!')
        }
        
    }

    reset() {
        this.config = JSON.parse(JSON.stringify(this.oldConfig));
    }
}