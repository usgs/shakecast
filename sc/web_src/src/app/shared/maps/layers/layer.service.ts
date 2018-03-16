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
//import { stationLayer } from './stations';

var layers = [epicenterLayer]//, mmiLayer, miLayer, pgaLayer, pgvLayer, stationLayer];

@Injectable()
export class LayerService {
  public nextLayer = new ReplaySubject(1);
  public data: any = {};
  public waiting = new Subscription();

  constructor(private http: HttpClient,
                private loadingService: LoadingService) {}

  genLayers(event) {
    // stop waiting on old map layers
    this.stopWaiting();

    // try to make the layers
    for (let layer of layers) {

      if (layer.url(event)) {
        // get the product
        this.loadingService.add(layer.name)
        this.waiting.add(
          this.http.get(layer.url(event), 
                          {responseType: layer['productType']})

            .subscribe(product => {
              // generate the layer
              layer['layer'] = layer.generateLayer(event, product);

              // let the map know it's ready
              this.nextLayer.next(layer);
              
              this.loadingService.finish(layer.name)
              // record data for later usage
              this.data[layer['id']] = product;
            })
          );
      } else {
        layer['layer'] = layer.generateLayer(event);

        this.nextLayer.next(layer);
      }
      
    }
  }

  stopWaiting() {
    // Stop existing request for layers
    this.waiting.unsubscribe();
  }

}
