import { Injectable } from '@angular/core';
import { BehaviorSubject ,  Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { LoadingService } from '@core/loading.service';

import { epicenterLayer } from './epicenter';
import { intensityLayer } from './intensity';
import { groupLayer } from './group';
import { facilityLayer } from './facility';
import { impactLayer } from './impact';


@Injectable()
export class LayerService {
  public error: any = null;
  public nextLayer = new BehaviorSubject(null);
  public data: any = {};
  public waiting = new Subscription();

  public needsKey = [facilityLayer];
  public needsMap = [facilityLayer];

  public layers = {
      'event': [epicenterLayer, intensityLayer, impactLayer],
      'group': [groupLayer]
  };

  constructor(private http: HttpClient,
                private loadingService: LoadingService) {}


  genEventLayers(event) {
    this.genLayers(event, 'event');
  }

  genGroupLayers(group) {
    this.genLayers(group, 'group');
  }

  genLayers(input, type_ = 'event') {
    // stop waiting on old map layers
    this.stopWaiting();

    // try to make the layers
    for (const layer of this.layers[type_]) {

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
                  this.error = error;
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
  addFacMarker(marker) {
    this.loadingService.add('Facility Markers');
    facilityLayer.addFacMarker(marker);

    this.loadingService.finish('Facility Markers');
  }

  removeFacMarker(facility) {
    facilityLayer.removeFacMarker(facility);
  }

  clear() {
    facilityLayer.clear();
  }

  stopWaiting() {
    // Stop existing request for layers
    // this.waiting.unsubscribe();
  }

}
