import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { NotificationsComponent } from './notifications.component';
import { NotificationHTMLService } from './notification.service';
import { SharedModule } from '@shared/shared.module';

@NgModule({
  declarations: [
    NotificationsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule
  ],
  providers: [
    NotificationHTMLService
  ],
  exports: [
    NotificationsComponent
  ]
})
export class NotificationsModule { }
