/**
 * angular2-cookie - Implementation of Angular 1.x $cookies service to Angular 2
 * @version v1.2.6
 * @link https://github.com/salemdar/angular2-cookie#readme
 * @license MIT
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Injectable, Optional } from '@angular/core';
import { CookieOptions } from './base-cookie-options';
import { CookieService } from './cookies.service';
export let CookieBackendService = class CookieBackendService extends CookieService {
    constructor(_defaultOptions) {
        super(_defaultOptions);
    }
    get cookieString() {
        return global.Zone.current.get('req').headers.cookie || '';
    }
    set cookieString(val) {
        global.Zone.current.get('req').headers.cookie = val;
        global.Zone.current.get('res').headers.cookie = val;
    }
};
CookieBackendService = __decorate([
    Injectable(),
    __param(0, Optional()), 
    __metadata('design:paramtypes', [CookieOptions])
], CookieBackendService);

//# sourceMappingURL=cookies.backend.service.js.map
