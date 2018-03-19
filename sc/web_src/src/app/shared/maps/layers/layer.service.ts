import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs/subscription';

import { LoadingService } from '../../../loading/loading.service';

//import { mmiLayer } from './cont_mmi';
//import { miLayer } from './cont_mi';
//import { pgaLayer } from './cont_pga';
//import { pgvLayer } from './cont_pgv';
import { epicenterLayer } from './epicenter';
import { intensityLayer } from './intensity';
import { groupLayer } from './group';
import { facilityLayer } from './facility';
//import { stationLayer } from './stations';


@Injectable()
export class LayerService {
  public error: any = null;
  public nextLayer = new ReplaySubject(1);
  public data: any = {};
  public waiting = new Subscription();
  
  public needsKey = [facilityLayer];
  public needsMap = [facilityLayer];

  public layers = {
      'event': [epicenterLayer, intensityLayer],//facilities
      'group': [groupLayer]
  }

  constructor(private http: HttpClient,
                private loadingService: LoadingService) {}


  genEventLayers(event) {
    this.genLayers(event, 'event')
  }

  genGroupLayers(group) {
    this.genLayers(group, 'group')
  }

  genLayers(input, type_='event') {
    // stop waiting on old map layers
    this.stopWaiting();

    // try to make the layers
    for (let layer of this.layers[type_]) {

      this.loadingService.add(layer.name);


      if (layer.url(input)) {
        // get the product


        const url = layer.url(input);

        this.waiting.add(
          this.http.get(url, 
                          {responseType: layer['productType']})
            .subscribe(
              product => {
                // generate the layer


                layer['layer'] = layer.generateLayer(input, product);

                // let the map know it's ready
                this.nextLayer.next(layer);
                
                // record data for later usage
                this.data[layer['id']] = product;
              },
              error => {
                this.error = error
                console.log(error);
              }
            )
          );
      } else {


        layer['layer'] = layer.generateLayer(input);

        this.nextLayer.next(layer);
      }
      
      this.loadingService.finish(layer.name);
    }
  }

  /* Facility layers require more options */
  addFacMarkers(markers) {
    this.loadingService.add('Facility Markers');

    var silent: boolean = (markers.length > 1)
    for (var mark in markers) {
        facilityLayer.addFacMarker(markers[mark], silent);
    }

    this.loadingService.finish('Facility Markers');
  }

  removeFacMarker(facility) {
    facilityLayer.removeFacMarker(facility);
  }

  stopWaiting() {
    // Stop existing request for layers
    //this.waiting.unsubscribe();
  }

}
