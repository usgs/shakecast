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
    public config: any = {type: "new_event",
                            body_color: "#ffffff",
                            admin_email: "sc.admin@gmail.com",
                            section_head: {
                                back_color: "#444444",
                                font_color: "#ffffff"
                            },
                            second_head: {
                                border_color: "#444444",
                                font_color: "#444444"
                            },
                            intro: {
                                back_color: "#ffffff",
                                font_color: "#444444",
                                text: "This report supersedes any earlier reports about this event. This is a computer-generated message and has not yet been reviewed by an Engineer or Seismologist. Epicenter and magnitude are published by the <a href=\"http://earthquake.usgs.gov/earthquakes/\" target=\"_blank\">USGS</a>.  Reported magnitude may be revised and will not be reported through ShakeCast. The <a href=\"http://earthquake.usgs.gov/earthquakes/\" target=\"_blank\">USGS</a> website should be referenced for the most up-to-date information.  Inspection prioritization emails will be sent shortly if ShakeCast determines significant shaking occurred at user's infrastructure. An interactive version of this report is accessible on the <a href=\"{{ sc.server_dns }}\" target=\"_blank\">ShakeCast internet/intranet.</a>"
                            },
                            footer: {
                                header_color: "#444444",
                                font_color: "#444444"
                            },
                            table: {
                                "border_color": "#444444"
                            }
    }

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