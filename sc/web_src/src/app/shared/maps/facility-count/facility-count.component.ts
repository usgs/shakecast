import { Component, OnInit, OnDestroy } from '@angular/core';
import { FacilityService } from '../../../shakecast-admin/pages/facilities/facility.service';
import { Subscription } from 'rxjs/subscription';

@Component({
  selector: 'shared-facility-count',
  templateUrl: './facility-count.component.html',
  styleUrls: ['./facility-count.component.css']
})
export class FacilityCountComponent implements OnInit {
  private subs = new Subscription();
  public count: any[] = [];

  constructor(private facService: FacilityService) { }

  ngOnInit() {
    this.subs.add(this.facService.facilityCount.subscribe((count: any) => {
      this.onCount(count)
    }));
  }

  onCount(count) {
    if (!count) {
      this.count = [];
    } else {
      this.count = count;
    }
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

}
