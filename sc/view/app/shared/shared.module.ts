import { NgModule }            from '@angular/core';
import { CommonModule }        from '@angular/common';
import { FormsModule }         from '@angular/forms';

// Map service and component
import { AgmCoreModule } from 'angular2-google-maps/core'
import { MapComponent } from './gmaps/map.component'

// scroll behavior
import { ScrollToggleDirective } from './directives/scroll-toggle.directive'

@NgModule({
  imports: [
        CommonModule,
        AgmCoreModule.forRoot({
        apiKey: 'AIzaSyBQE3bvBOlyD1td50LJtYmy0WxynUdd4IM'})
        ],
  declarations: [MapComponent,
                 ScrollToggleDirective],
  exports: [MapComponent,
            CommonModule, 
            FormsModule,
            ScrollToggleDirective]
})
export class SharedModule { }