import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { EarthquakeService } from '@core/earthquake.service';
import { FacilityService } from '@core/facility.service';

@Component({
  selector: 'shared-impact',
  templateUrl: './impact.component.html',
  styleUrls: ['./impact.component.css']
})
export class ImpactComponent implements OnInit {
  private subs = new Subscription();
  public shakingData = null;
  public totalShaking = 0;

  constructor(public facService: FacilityService,
              public eqService: EarthquakeService) { }

  ngOnInit() {

    this.subs.add(this.eqService.selectEvent.subscribe(eq => {
      this.onSelectEq(eq);
    }));

    // subscribe to facility data to create a total shaking div
    this.subs.add(this.facService.impactSummary.subscribe((shaking: any) => {
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

  onSelectEq(eq) {
    if (eq == null) {
      this.totalShaking = 0;
      this.shakingData = null;

      return;
    }

    this.facService.getImpactSummary(eq.properties.event_id);
  }

  ngOnDestroy() {
    this.facService.impactSummary.next(null);
    this.subs.unsubscribe();
  }

}
