/**
 * angular2-cookie - Implementation of Angular 1.x $cookies service to Angular 2
 * @version v1.2.6
 * @link https://github.com/salemdar/angular2-cookie#readme
 * @license MIT
 */
import {BaseCookieOptions, CookieOptions, CookieService} from './services';

export * from './services';

export const ANGULAR2_COOKIE_PROVIDERS = [
  {provide: CookieOptions, useClass: BaseCookieOptions},
  {provide: CookieService, useFactory: cookieServiceFactory, deps: [CookieOptions]}
];

export function cookieServiceFactory(options: CookieOptions) {
  return new CookieService(options);
}
