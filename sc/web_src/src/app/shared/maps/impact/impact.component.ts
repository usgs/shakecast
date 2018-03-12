import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { FacilityService } from '../../../shakecast-admin/pages/facilities/facility.service';

@Component({
  selector: 'shared-impact',
  templateUrl: './impact.component.html',
  styleUrls: ['./impact.component.css']
})
export class ImpactComponent implements OnInit {
  private subs = new Subscription();
  public shakingData = null;
  public totalShaking = 0;

  constructor(public facService: FacilityService) { }

  ngOnInit() {

    // subscribe to facility data to create a total shaking div
    this.subs.add(this.facService.shakingData.subscribe((shaking: any) => {
      this.shakingData = shaking;

      if (shaking) {
          this.totalShaking = shaking['gray'] + 
                                  shaking['green'] + 
                                  shaking['yellow'] + 
                                  shaking['orange'] + 
                                  shaking['red'];
      } else {
          this.totalShaking = 0;
      }
    }));
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

}
