import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { MapService } from '@core/map.service';
import { EarthquakeService } from '@core/earthquake.service';
import { LayerService } from './layers/layer.service';
import { FacilityService } from '@core/facility.service';

import * as L from 'leaflet';
import * as _ from 'underscore';
import 'leaflet-makimarkers';

@Component({
    selector: 'my-map',
    templateUrl: './map.component.html',
    styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit, OnDestroy {
    public center: any = {};
    private mapKey: string = null;

    private onMap: any[] = [];
    private subscriptions = new Subscription();
    private map: any;

    private layerControl = L.control;

    private error: any = null;

    constructor(private mapService: MapService,
                private facService: FacilityService,
                private eqService: EarthquakeService,
                private layerService: LayerService) {}

    ngOnInit() {
        this.mapService.getMapKey().subscribe((key: string) => {
            this.mapKey = key
            this.initMap();

            // set key for map layers
            for (let layer of this.layerService.needsKey) {
                layer.mapKey = key;
            }

            // allow access to map controls
            for (let layer of this.layerService.needsMap) {
                layer.map = this.map;
            }

        });
    }

    initMap() {
        this.map = L.map('map', {
            scrollWheelZoom: false
        }).setView([51.505, -0.09], 8);

        this.map.on('moveend', (event) => { this.updateBounds(event); });

        // create basemap
        const basemap = this.getBasemap();
        basemap.addTo(this.map);

        this.layerControl = L.control.layers({'Basemap': basemap}, null).addTo(this.map);

        this.subscriptions.add(this.eqService.selectEvent.subscribe((event) => {
            this.onEvent(event);
        }));

        this.subscriptions.add(this.mapService.groupPoly.subscribe(group => {
            this.onGroup(group);
        }));

        this.subscriptions.add(this.layerService.nextLayer.subscribe((layer) => {
            if (layer != null) {
                this.onLayer(layer);
            }
        }));

        this.subscriptions.add(this.facService.select.subscribe(fac => {
            if (fac != null) {
                const facMarker = this.mapService.makeFacMarker(fac.properties);
                this.layerService.addFacMarker(facMarker);

                this.map.panTo(new L.LatLng(facMarker.lat,
                                                facMarker.lon));
            }
        }));


        // subscribe to REMOVING facility markers
        this.subscriptions.add(this.mapService.removeFacMarkers.subscribe(fac => {
            this.layerService.removeFacMarker(fac);
        }));

        // subscribe to clearing the map
        this.subscriptions.add(this.mapService.clearMapNotify.subscribe(notification => {
            this.clearLayers();
        }));
    }

    onEvent(event) {
        this.clearLayers();

        if (event === null) {
            return;
        } else {
            this.layerService.genEventLayers(event);
        }
    }

    onGroup(group) {
        this.layerService.genGroupLayers(group);
    }

    onLayer(layer) {
        if (!layer.layer || !this.map) {
            return;
        }

        layer['layer'].addTo(this.map);
        this.onMap.push(layer);

        // align map
        const layers = this.onMap.map((layer_) => {
            return layer_.layer;
        });

        const group = L.featureGroup(layers);
        const bounds = group.getBounds();

        if (bounds._southWest && bounds._northEast) {
          this.map.fitBounds(bounds.pad(0.1));
        }

        // open epicenter popup
        if (layer.id === 'epicenter') {
            layer.layer.openPopup();
        }

        // add to map control
        this.layerControl.addOverlay(layer.layer, layer.name);
    }

    getBasemap() {
        return L.tileLayer(
          'https://services.arcgisonline.com/' +
              'arcgis/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
          {
            attribution:
              'Esri, HERE, Garmin, Intermap, increment P Corp., ' +
              'GEBCO, USGS, FAO, NPS, NRCAN, GeoBase, IGN, Kadaster NL, ' +
              'Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), ' +
              'swisstopo, © OpenStreetMap contributors, and the GIS User ' +
              'Community',
            maxZoom: 16
          }
        );
    }

    clearLayers() {
        /*
        Clear all layers besides basemaps
        */

        this.map.eachLayer(layer => {
            this.map.removeLayer(layer);
        });

        this.onMap = [];

        this.map.removeControl(this.layerControl);

        const basemap = this.getBasemap();
        basemap.addTo(this.map);

        this.layerControl = L.control.layers({'Basemap': basemap}, null).addTo(this.map);
    }

    ngOnDestroy() {
        this.layerService.clear();
        this.subscriptions.unsubscribe();
    }

    updateBounds(event) {
        if (this.mapService) {
            this.mapService.bounds = event.target.getBounds();
        }
    }

}
