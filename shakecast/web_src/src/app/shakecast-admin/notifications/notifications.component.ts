import {
  Component,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  HostListener
} from '@angular/core';
import { TitleService } from '@core/title.service';
import { NotificationHTMLService } from './notification.service';
import { NotificationsService } from 'angular2-notifications';
import { timer } from 'rxjs';

import * as _ from 'underscore';

@Component({
  selector: 'notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit, OnDestroy {
  private subscriptions: any[] = [];
  public notification = '';
  public name = 'default';
  public tempNames: any = [];
  public config: any = {};
  public oldConfig: any = {};
  public previewConfig: any = {};
  public eventType = 'new_event';
  public enteringNew = false;
  public newName = '';
  public imageNames: string[] = [];

  constructor(
    private titleService: TitleService,
    public notHTMLService: NotificationHTMLService,
    private notService: NotificationsService
  ) {}

  @ViewChild('notificationContainer') notContainer: ElementRef;

  ngOnInit() {
    this.titleService.title.next('Notifications');

    this.subscriptions.push(
      this.notHTMLService.config.subscribe((config: any) => {
        this.config = config;
        this.oldConfig = JSON.parse(JSON.stringify(config));
        this.previewConfig = JSON.parse(JSON.stringify(config));
      })
    );

    this.subscriptions.push(
      this.notHTMLService.name.subscribe((name: any) => {
        this.name = name;
      })
    );

    this.subscriptions.push(
      timer(0, 3000).subscribe((x: any) => {
        this.preview(this.name, this.eventType, this.config);
      })
    );

    this.notHTMLService.getNotification(this.name, this.eventType);
    this.notHTMLService.getConfigs('new_event', this.name);
    this.notHTMLService.getTemplateNames();
    this.notHTMLService.getImageNames();
  }

  getNotification(name: string, eventType: string, config: any = null) {
    this.eventType = eventType;
    this.name = name;
    this.notHTMLService.getNotification(name, eventType, config);
    this.notHTMLService.getConfigs(eventType, name);
  }

  preview(name: string, eventType: string, config: any = null) {
    if (!_.isEqual(this.config, this.previewConfig)) {
      this.notHTMLService.getNotification(name, eventType, config);
      this.previewConfig = JSON.parse(JSON.stringify(this.config));
    }
  }

  saveConfigs() {
    if (!_.isEqual(this.config, this.oldConfig)) {
      this.notHTMLService.saveConfigs(this.name, this.config);
      this.oldConfig = JSON.parse(JSON.stringify(this.config));
    } else {
      this.notService.info('No Changes', 'These configs are already in place!');
    }
  }

  reset() {
    this.config = JSON.parse(JSON.stringify(this.oldConfig));
  }

  @HostListener('window:keydown', ['$event'])
  keyboardInput(event: any) {
    if (this.enteringNew === true) {
      if (event.keyCode === 13) {
        if (this.newName !== '') {
          // remove unwanted characters
          const cleanName = this.newName.replace(/[^\w]/gi, '');

          this.notHTMLService.newTemplate(cleanName);
          this.enteringNew = false;
          this.newName = '';
          this.notHTMLService.getTemplateNames();
        }
      }
    } else {
      if (event.keyCode === 13) {
        this.preview(this.name, this.eventType, this.config);
      }
    }
  }

  endSubscriptions() {
    for (const sub of this.subscriptions) {
      sub.unsubscribe();
    }
  }

  ngOnDestroy() {
    this.endSubscriptions();
  }
}
