/**
 * angular2-cookie - Implementation of Angular 1.x $cookies service to Angular 2
 * @version v1.2.6
 * @link https://github.com/salemdar/angular2-cookie#readme
 * @license MIT
 */
"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
var services_1 = require('./services');
__export(require('./services'));
exports.ANGULAR2_COOKIE_PROVIDERS = [
    { provide: services_1.CookieOptions, useClass: services_1.BaseCookieOptions },
    { provide: services_1.CookieService, useFactory: cookieServiceFactory, deps: [services_1.CookieOptions] }
];
function cookieServiceFactory(options) {
    return new services_1.CookieService(options);
}
exports.cookieServiceFactory = cookieServiceFactory;

//# sourceMappingURL=core.js.map
