import { Component, onInit } from '@angular/core';

@Component({
  selector: 'my-map',
  templateUrl: 'app/shared/gmaps/map.component.html',
  styleUrls: ['app/shared/gmaps/map.component.css']
})
export class MapComponent implements onInit {
// google maps zoom level
  zoom: number = 8;
  
  // initial center position for the map
  lat: number = 51.673858;
  lng: number = 7.815982;

  ngOnInit() {
    console.log('Map Init')
  }
}

// just an interface for type safety.
interface marker {
	lat: number;
	lng: number;
	label?: string;
	draggable: boolean;
}