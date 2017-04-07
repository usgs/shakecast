import { Component,
         OnInit,
         OnDestroy } from '@angular/core';

import { EarthquakeService } from '../earthquakes/earthquake.service'
import { FacilityService } from '../../../shakecast-admin/pages/facilities/facility.service'
import { TitleService } from '../../../title/title.service';

import { showLeft, showRight, showBottom } from '../../../shared/animations/animations';

@Component({
    selector: 'dashboard',
    templateUrl: 'app/shakecast/pages/dashboard/dashboard.component.html',
    styleUrls: ['app/shakecast/pages/dashboard/dashboard.component.css',
                  'app/shared/css/panels.css'],
    animations: [ showLeft, showRight, showBottom ]
})
export class DashboardComponent implements OnInit, OnDestroy {
    public facilityData: any = [];
    public earthquakeData: any = [];
    private subscriptions: any[] = [];

    public showBottom: string = 'hidden';
    public showLeft: string = 'hidden';
    public showRight: string = 'hidden';

    constructor(private eqService: EarthquakeService,
                private facService: FacilityService,
                private titleService: TitleService) {}
  
  ngOnInit() {
      this.titleService.title.next('Dashboard')
      this.subscriptions.push(this.eqService.earthquakeData.subscribe((eqs: any[]) => {
          this.earthquakeData = eqs;
          if (eqs.length > 0) {
            this.eqService.plotEq(eqs[0])
          }
      }));
      
      this.subscriptions.push(this.facService.facilityData.subscribe(facs => {
          this.facilityData = facs;
      }));
      this.eqService.getData({filter: {'timeframe': 'day'}});
  }

  toggleLeft() {
      if (this.showLeft == 'hidden') {
          this.showLeft = 'shown';
      } else {
          this.showLeft = 'hidden'
      }
  }

  toggleRight() {
      if (this.showRight == 'hidden') {
          this.showRight = 'shown';
      } else {
          this.showRight = 'hidden'
      }
  }

  toggleBottom() {
      if (this.showBottom == 'hidden') {
          this.showBottom = 'shown';
      } else {
          this.showBottom = 'hidden'
      }
  }
  
  ngOnDestroy() {
        this.endSubscriptions()
    }

    endSubscriptions() {
        for (var sub in this.subscriptions) {
            this.subscriptions[sub].unsubscribe()
        }
    }
}