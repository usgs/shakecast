import { Component, OnInit, OnDestroy } from '@angular/core';
import { FacilityService } from '@core/facility.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'shared-facility-count',
  templateUrl: './facility-count.component.html',
  styleUrls: ['./facility-count.component.css']
})
export class FacilityCountComponent implements OnInit, OnDestroy {
  private subs = new Subscription();
  public types = {};

  constructor(private facService: FacilityService) { }

  ngOnInit() {
    this.subs.add(this.facService.facilityData.subscribe((facilities: any) => {
      if (!facilities || !facilities.features) {
        this.types = {};
        return null;
      }

      this.onFacilities(facilities.features);
    }));
  }

  onFacilities(facilities: any[]) {
    const facTypes = {};
    facilities.forEach(fac => {
      if (!facTypes[fac.properties.facility_type]) {
        facTypes[fac.properties.facility_type] = 1;
      } else {
        facTypes[fac.properties.facility_type] += 1;
      }
    });

    this.types = facTypes;
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

}
