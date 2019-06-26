import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { NotificationsComponent } from './notifications.component';
import { NotificationHTMLService } from './notification.service';
import { SharedModule } from '@shared/shared.module';
import { NewEventComponent } from './new-event/new-event.component';
import { FacilitiesComponent } from './facilities/facilities.component';
import { PdfComponent } from './pdf/pdf.component';

@NgModule({
  declarations: [
    NotificationsComponent,
    NewEventComponent,
    FacilitiesComponent,
    PdfComponent
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
