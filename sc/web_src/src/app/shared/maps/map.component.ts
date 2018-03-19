declare function require(string): string;

import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Marker } from './map.service';
import { MapService } from './map.service'
import { EarthquakeService } from '../../shakecast/pages/earthquakes/earthquake.service';
import { LayerService } from './layers/layer.service'
import { FacilityService } from '../../shakecast-admin/pages/facilities/facility.service';
import { LoadingService } from '../../loading/loading.service';
import { NotificationsService } from 'angular2-notifications';

import * as L from 'leaflet';
import 'leaflet-makimarkers';

import * as _ from 'underscore';


@Component({
    selector: 'my-map',
    templateUrl: './map.component.html',
    styleUrls: ['./map.component.css']
}) 

export class MapComponent implements OnInit, OnDestroy {
    public center: any = {};
    private mapKey: string = null

    private onMap: any[] = [];
    private subscriptions: any = [];
    private map: any;

    constructor(private mapService: MapService,
                private facService: FacilityService,
                private loadingService: LoadingService,
                private changeDetector: ChangeDetectorRef,
                private eqService: EarthquakeService,
                private layerService: LayerService) {}

    ngOnInit() {
        this.subscriptions.push(this.mapService.getMapKey().subscribe((key: string) => {
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
        }));
    }

    initMap() {
        var this_: any = this;
        this.map = L.map('map', {
            scrollWheelZoom: false
        }).setView([51.505, -0.09], 8);

        let basemap = this.getBasemap();
        basemap.addTo(this.map);

        this.subscriptions.push(this.eqService.selectEvent.subscribe((event) => {
            this.onEvent(event);
        }));

        this.subscriptions.push(this.mapService.groupPoly.subscribe(group => {
            this.onGroup(group);
        }));

        this.subscriptions.push(this.layerService.nextLayer.subscribe((layer) => {
            this.onLayer(layer);
        }));

        // subscribe to facility markers
        this.subscriptions.push(this.mapService.facMarkers.subscribe((markers: any[]) => {
            this.layerService.addFacMarkers(markers);
        }));

        // subscribe to REMOVING facility markers
        this.subscriptions.push(this.mapService.removeFacMarkers.subscribe(fac => {
            this.layerService.removeFacMarker(fac);
        }));

        // subscribe to clearing the map
        this.subscriptions.push(this.mapService.clearMapNotify.subscribe(notification => {
            this.clearLayers();
        }));
    }

    onEvent(event) {
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
        layer['layer'].addTo(this.map);
        this.onMap.push(layer);

        // align map
        const layers = []
        for (let layer in this.onMap) {
            layers.push(this.onMap[layer].layer)
        }
        let group = L.featureGroup(layers);
        this.map.fitBounds(group.getBounds().pad(0.1));
    }

    getBasemap() {
        return L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=' + this.mapKey, {
			maxZoom: 18,
			attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
				'<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
				'Imagery � <a href="http://mapbox.com">Mapbox</a>',
			id: 'mapbox.streets'
		})
    }

    clearEventLayers() {
        this.clearLayers();
    }

    clearLayers() {
        /*
        Clear all layers besides basemaps
        */

        this.map.eachLayer(layer => {
            this.map.removeLayer(layer);
        });

        this.onMap = [];

        let basemap = this.getBasemap();
        basemap.addTo(this.map);
    }

    ngOnDestroy() {
        this.endSubscriptions();
    }

    endSubscriptions() {
        for (var sub in this.subscriptions) {
            this.subscriptions[sub].unsubscribe();
        }
    }

}