import { NgModule }       from '@angular/core';
import { CommonModule }   from '@angular/common';
import { FormsModule }    from '@angular/forms';

import { EarthquakeListComponent }    from './earthquake-list.component';
import { earthquakesRouting } from './earthquakes.routing';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    earthquakesRouting
  ],
  declarations: [
    EarthquakeListComponent
  ],
  providers: [
  ]
})
export class EarthquakesModule {}