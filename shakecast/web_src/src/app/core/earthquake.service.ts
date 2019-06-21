import { Injectable } from '@angular/core';
import { Response, Headers, RequestOptions } from '@angular/http';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';

import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';

import { MapService } from '@core/map.service';
import { NotificationService } from '@core/notification.service';
import { NotificationsService } from 'angular2-notifications';
import { FacilityService } from '@core/facility.service';

import { LoadingService } from '@core/loading.service';

import * as _ from 'underscore';

export interface Earthquake {
    shakecast_id: string;
    event_id: string;
    magnitude: number;
    depth: number;
    lat: number;
    lon: number;
    description: string;
    shakemaps: number;
}

export interface filter  {
    shakemap?: boolean;
    facilities?: boolean;
    latMax?:  number;
    latMin?: number;
    lonMax?: number;
    lonMin?: number;
    groupAffected?: string;
    timeframe?: string;
}

@Injectable()
export class EarthquakeService {
    public earthquakeData = new BehaviorSubject(null);
    public dataLoading = new BehaviorSubject(null);
    public plotting = new BehaviorSubject(null);
    public showScenarioSearch = new BehaviorSubject(null);
    public selectEvent = new BehaviorSubject(null);
    public current: any = [];
    public filter: filter = {
        shakemap: true,
        facilities: false,
        timeframe: 'week'
    };

    public configs: any = {clearOnPlot: 'all'};
    public selected: Earthquake = null;

    constructor(private _http: HttpClient,
                private notService: NotificationService,
                public mapService: MapService,
                private facService: FacilityService,
                private _router: Router,
                private toastService: NotificationsService,
                private loadingService: LoadingService) {}

    getData(filter: any = {}) {
        this.loadingService.finish('Facilities');
        if (this.facService.sub) {
            this.facService.sub.unsubscribe();
        }
        if (this.filter) {
            this.filter = filter;
        }

        const params = new HttpParams().set('filter', JSON.stringify(filter));
        this._http.get('api/earthquake-data', {params: params})
            .subscribe(
                (result: any) => {
                    this.earthquakeData.next(result.data);
                },
                (err: any) => {
                    this.toastService.alert('Event Error', 'Unable to retreive some event information')
                }
            );
    }

    clearData() {
        this.mapService.clearMap();
    }

    getDataFromWeb(filter: any = {}) {
        if (this.facService.sub) {
            this.facService.sub.unsubscribe();
        }

        this.loadingService.add('Scenarios');
        const scenario = filter['scenariosOnly'];

        let usgs: string;
        if (scenario) {
            usgs = 'https://earthquake.usgs.gov/fdsnws/scenario/1/query';
        } else {
            usgs = 'https://earthquake.usgs.gov/fdsnws/event/1/query';
        }

        filter['format'] = 'geojson';

        // get params from filter
        if (!filter['starttime']) {
            filter['starttime'] = '2005-01-01';
        }

        if (!filter['minmagnitude']) {
            filter['minmagnitude'] = '6';
        }

        // only get events with shakemaps
        if (!scenario) {
            filter['producttype'] = 'shakemap';
        } else {
            filter['producttype'] = 'shakemap-scenario';
        }

        // get bounds
        filter['maxlatitude'] = this.mapService.bounds.getNorth();
        filter['minlatitude'] = this.mapService.bounds.getSouth();
        filter['maxlongitude'] = this.mapService.bounds.getEast();
        filter['minlongitude'] = this.mapService.bounds.getWest();

        let params = new HttpParams();
        for (const search in filter) {
            if ((search !== 'scenariosOnly') && (filter[search])) {
                params = params.set(search, filter[search]);
            }
        }

        this._http.get(usgs, {params: params})
            .subscribe((result: any) => {
                // convert from geoJSON to sc conventions
                let data: any[] = [];
                if (result.hasOwnProperty('features')) {
                    data = this.geoJsonToSc(result['features']);
                } else {
                    data = this.geoJsonToSc([result]);
                }

                for (const eq of data) {
                    eq['scenario'] = scenario;
                }

                this.earthquakeData.next(data);
                this.loadingService.finish('Scenarios');
            },
            (error: any) => {
                this.earthquakeData.next([]);
                this.loadingService.finish('Scenarios');
            });
    }

    downloadScenario(scenario_id: string, scenario:boolean = false) {
        const params = new HttpParams().set('scenario', JSON.stringify(scenario))
        this._http.get('api/scenario-download/' + scenario_id, {params: params})
            .subscribe((result: any) => {
                this.toastService.success('Scenario: ' + scenario_id, 'Download starting...')
            });
    }

    deleteScenario(scenario_id: string) {
        this._http.delete('api/scenario-delete/' + scenario_id)
            .subscribe((result: any) => {
                this.toastService.success('Delete Scenario: ' + scenario_id, 'Deleting... This may take a moment')
            });
    }

    runScenario(scenario_id: string) {
        this._http.post('api/scenario-run/' + scenario_id, {})
            .subscribe((result: any) => {
                this.toastService.success('Run Scenario: ' + scenario_id, 'Running Scenario... This may take a moment')
            });
    }

    getFacilityData(facility: any) {
        this._http.get('api/earthquake-data/facility/' + facility['shakecast_id'])
            .subscribe((result: any) => {
                this.earthquakeData.next(result.data);
                this.current = result.data;
            });
    }

    plotEq(eq: Earthquake) {
        if (eq) {
            this.selectEvent.next(eq);
        } else {
            this.clearData();
        }
    }

    geoJsonToSc(geoJson: any[]) {
        /*
        Change field names from geoJson events to what we would
        Expect from the ShakeCast database
        */

        for (const eq of geoJson) {
            eq['shakecast_id'] = null;
            eq['event_id'] = eq['id'];
            eq['magnitude'] = eq['properties']['mag'];
            eq['lon'] = eq['geometry']['coordinates'][0];
            eq['lat'] = eq['geometry']['coordinates'][1];
            eq['depth'] = eq['geometry']['coordinates'][2];
            eq['place'] = eq['properties']['place'];

            if (eq['properties']['types'].indexOf('shakemap') > 0) {
                eq['shakemaps'] = 1;
            } else {
                eq['shakemaps'] = 0;
            }
        }
        return geoJson;
    }
}
