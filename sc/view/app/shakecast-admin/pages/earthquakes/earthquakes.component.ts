import { Component } from '@angular/core';

import { EarthquakeListComponent } from './earthquake-list.component'

@Component({
  selector: 'earthquakes',
  template: `<h3>Earthquakes Admin</h3>
<earthquake-list></earthquake-list>`
})
export class EarthquakesComponent {
}