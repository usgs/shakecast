import { Component,
         OnInit,
         OnDestroy } from '@angular/core';

import { TitleService } from '../../../title/title.service';
import { ConfigService } from './config.service';
import { TimeService } from './time.service';
import { NotificationsService } from 'angular2-notifications';
declare var _: any;

@Component({
  selector: 'config',
  templateUrl: 'app/shakecast-admin/pages/config/config.component.html',
  styleUrls: ['app/shakecast-admin/pages/config/config.component.css']
})
export class ConfigComponent implements OnInit, OnDestroy {
    private subscriptions: any[] = []
    private oldConfigs: any = {}
    public configs: any = {"Logging": {"log_file": "", "log_level": "", "log_rotate": 0}, "DBConnection": {"username": "", "retry_count": 0, "password": "", "type": "sqlite", "retry_interval": 0}, "Notification": {"default_template_new_event": "", "default_template_inspection": "", "default_template_pdf": ""}, "SMTP": {"username": "", "from": "", "envelope_from": "", "server": "", "security": "", "password": "", "port": 0}, "Server": {"software_version": "", "name": "", "DNS": ""}, "gmap_key": "", "Proxy": {"username": "", "use": false, "password": "", "port": 0, "server": ""}, "Services": {"use_geo_json": true, "ignore_nets": [], "new_eq_mag_cutoff": 0, "keep_eq_for": 0, "nighttime": 0, "check_new_int": 0, "night_eq_mag_cutoff": 0, "geo_json_web": "", "eq_req_products": [], "morning": 0, "archive_mag": 0, "geo_json_int": 0}, "timezone": 0}

    constructor(private confService: ConfigService,
                public timeService: TimeService,
                private notService: NotificationsService,
                private titleService: TitleService) {}

    ngOnInit() {
        this.titleService.title.next('Settings');
        this.subscriptions.push(this.confService.configs.subscribe(configs => {
            this.configs = configs;
            this.oldConfigs = JSON.parse(JSON.stringify(this.configs));
        }));

        this.confService.getConfigs();
    }

    hourUp() {
        this.configs.timezone += 1;
    }

    hourDown () {
        this.configs.timezone -= 1;
    }

    nighttimeUp() {
        this.configs.Services.nighttime += 1;
    }

    nighttimeDown () {
        this.configs.Services.nighttime -= 1;
    }

    morningUp() {
        this.configs.Services.morning += 1;
    }

    morningDown () {
        this.configs.Services.morning -= 1;
    }

    saveConfigs() {
        if (!_.isEqual(this.configs,this.oldConfigs)) {
            this.confService.saveConfigs(this.configs);
            this.oldConfigs = JSON.parse(JSON.stringify(this.configs));
        } else {
            this.notService.info('No Changes', 'These configs are already in place!')
        }
    }

    resetConfigs() {
        this.configs = JSON.parse(JSON.stringify(this.oldConfigs));
    }

    setTime() {

    }

    ngOnDestroy() {}
}