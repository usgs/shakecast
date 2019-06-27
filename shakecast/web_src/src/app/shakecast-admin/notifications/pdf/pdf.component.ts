import { Component, OnInit } from '@angular/core';

import { NotificationHTMLService } from '../notification.service';

@Component({
  selector: 'notifications-pdf',
  templateUrl: './pdf.component.html',
  styleUrls: ['./pdf.component.css', '../configs.css']
})
export class PdfComponent {

  constructor(public notService: NotificationHTMLService) { }

}
