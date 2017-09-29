import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions, URLSearchParams } from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { Observable } from 'rxjs/Observable';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { Router } from '@angular/router';

import { MapService } from '../../../shared/maps/map.service'
import { NotificationService } from '../dashboard/notification-dash/notification.service.ts'
import { NotificationsService } from 'angular2-notifications'
import { FacilityService } from '../../../shakecast-admin/pages/facilities/facility.service.ts'

import { LoadingService } from '../../../loading/loading.service';

declare var _: any;

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
    public earthquakeData = new ReplaySubject(1);
    public dataLoading = new ReplaySubject(1);
    public plotting = new ReplaySubject(1);
    public showScenarioSearch = new ReplaySubject(1);
    public current: any = []
    
    public filter: filter = {
        shakemap: true,
        facilities: false,
        timeframe: 'week'
    }

    public configs: any = {clearOnPlot: 'all'};
    public selected: Earthquake = null;

    constructor(private _http: Http,
                private notService: NotificationService,
                public mapService: MapService,
                private facService: FacilityService,
                private _router: Router,
                private toastService: NotificationsService,
                private loadingService: LoadingService) {}

    getData(filter: any = {}) {
        if (this.facService.sub) {
            this.facService.sub.unsubscribe();
        }
        if (this.filter) {
            this.filter = filter
        }
        this.dataLoading.next(true);
        let params = new URLSearchParams();
        params.set('filter', JSON.stringify(filter))
        this._http.get('/api/earthquake-data', {search: params})
            .map((result: Response) => result.json())
            .subscribe(
                (result: any) => {
                    // build event_id arrays
                    var current_events = []
                    var new_events = []
                    for (let event_idx in this.current) {
                        current_events.push(this.current[event_idx]['event_id'])
                    }
                    for (let event_idx in result.data) {
                        new_events.push(result.data[event_idx]['event_id'])
                    }

                    if (result.data.length > 0) {
                        if ((!_.isEqual(current_events, new_events)) || (this._router.url != '/shakecast/dashboard')) {
                            this.current = result.data
                            this.earthquakeData.next(result.data);
                        }
                    } else {
                        this.current = []
                        this.earthquakeData.next([]);
                    }
                    this.dataLoading.next(false);
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

        this.loadingService.add('Scenarios')
        var scenario = filter['scenariosOnly'];

        var usgs: string;
        if (scenario) {
            usgs = 'https://earthquake.usgs.gov/fdsnws/scenario/1/query';
        } else {
            usgs = 'https://earthquake.usgs.gov/fdsnws/event/1/query';
        }

        //delete filter['scenariosOnly'];

        filter['format'] = 'geojson'

        // get params from filter
        if (!filter['starttime']) {
            filter['starttime'] = '2005-01-01'
        }

        if (!filter['minmagnitude']) {
            filter['minmagnitude'] = '6'
        }

        // only get events with shakemaps
        if (!scenario) {
            filter['producttype'] = 'shakemap'
        } else {
            filter['producttype'] = 'shakemap-scenario'
        }


        let params = new URLSearchParams();
        for (var search in filter) {
            if (search != 'scenariosOnly') {
                params.set(search, filter[search])
            }
        }
        
        this._http.get(usgs, {search: params})
            .map((result: Response) => result.json())
            .catch((error: any) => {
                return Observable.throw('');
            })
            .subscribe((result: any) => {
                // convert from geoJSON to sc conventions
                var data: any[] = []
                if (result.hasOwnProperty('features')) {
                    data = this.geoJsonToSc(result['features']);
                } else {
                    data = this.geoJsonToSc([result]);
                }

                for (var eq in data) {
                    data[eq]['scenario'] = scenario;
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
        let params = new URLSearchParams();
        params.set('scenario', JSON.stringify(scenario))
        this._http.get('/api/scenario-download/' + scenario_id, {search: params})
            .map((result: Response) => result.json())
            .subscribe((result: any) => {
                this.toastService.success('Scenario: ' + scenario_id, 'Download starting...')
            });
    }

    deleteScenario(scenario_id: string) {
        this._http.delete('/api/scenario-delete/' + scenario_id)
            .map((result: Response) => result.json())
            .subscribe((result: any) => {
                this.toastService.success('Delete Scenario: ' + scenario_id, 'Deleting... This may take a moment')
            });
    }

    runScenario(scenario_id: string) {
        this._http.post('/api/scenario-run/' + scenario_id)
            .map((result: Response) => result.json())
            .subscribe((result: any) => {
                this.toastService.success('Run Scenario: ' + scenario_id, 'Running Scenario... This may take a moment')
            });
    }

    getFacilityData(facility: any) {
        this._http.get('/api/earthquake-data/facility/' + facility['shakecast_id'])
            .map((result: Response) => result.json())
            .subscribe((result: any) => {
                this.earthquakeData.next(result.data);
                this.current = result.data
            })
    }
    
    plotEq(eq: Earthquake) {
        if (eq) {
            // get relevant notification info... this should really be up to the page...
            this.notService.getNotifications(eq);
            //this.plotting.next(eq);

            // plots the eq with the relevant config to clear all data or notification
            // this could probably be done better...
            this.mapService.plotEq(eq, this.configs['clearOnPlot']);

            // get relevant facility info and plot it
            this.facService.getShakeMapData(eq);
        }
        else {
            this.clearData();
        }
    }

    geoJsonToSc(geoJson: any[]) {
        /* 
        Change field names from geoJson events to what we would
        Expect from the ShakeCast database 
        */

        for (var eq_id in geoJson) {
            var eq = geoJson[eq_id]
            geoJson[eq_id]['shakecast_id'] = null;
            geoJson[eq_id]['event_id'] = eq['id'];
            geoJson[eq_id]['magnitude'] = eq['properties']['mag']
            geoJson[eq_id]['lon'] = eq['geometry']['coordinates'][0]
            geoJson[eq_id]['lat'] = eq['geometry']['coordinates'][1]
            geoJson[eq_id]['depth'] = eq['geometry']['coordinates'][2]
            geoJson[eq_id]['place'] = eq['properties']['place']

            if (eq['properties']['types'].indexOf('shakemap') > 0) {
                geoJson[eq_id]['shakemaps'] = 1
            } else {
                geoJson[eq_id]['shakemaps'] = 0
            }       
        }
        return geoJson
    }
}