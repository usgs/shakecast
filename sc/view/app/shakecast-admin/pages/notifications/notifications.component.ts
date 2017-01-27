import { Component,
         OnInit, 
         OnDestroy,
         HostListener,
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
import { Observable } from 'rxjs/Observable';

declare var _: any;

@Component({
    selector: 'notifications',
    templateUrl: 'app/shakecast-admin/pages/notifications/notifications.component.html',
    styleUrls: ['app/shakecast-admin/pages/notifications/notifications.component.css']
})
export class NotificationsComponent implements OnInit {
    private subscriptions: any[] = [];
    public notification: string = '';
    public name: string = 'default';
    public config: any = {}
    public oldConfig: any = {}
    public previewConfig: any = {}
    public eventType: string = 'new_event';

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
                this.previewConfig = JSON.parse(JSON.stringify(config));
            })
        );

        this.subscriptions.push(Observable.interval(3000).subscribe(x => {
            this.preview(this.name,
                         this.eventType,
                         this.config);
        }));

        this.notHTMLService.getNotification(this.name, 'new_event');
        this.notHTMLService.getConfigs('new_event', this.name)
    }

    getNotification(name: string,
                    eventType: string,
                    config: any = null) {
        this.eventType = eventType;
        this.name = name;
        this.notHTMLService.getNotification(name, eventType, config);
        this.notHTMLService.getConfigs(eventType, name);
    }

    preview(name:string,
            eventType: string,
            config: any = null) {
        if (!_.isEqual(this.config,this.previewConfig)) {
            this.notHTMLService.getNotification(name, eventType, config)
            this.previewConfig = JSON.parse(JSON.stringify(this.config));
        }
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

    @HostListener('window:keydown', ['$event'])
    keyboardInput(event: any) {
        if (event.keyCode === 13) {
            this.preview(this.name,
                         this.eventType,
                         this.config);
        }
    }
}