/**
 * angular2-cookie - Implementation of Angular 1.x $cookies service to Angular 2
 * @version v1.2.6
 * @link https://github.com/salemdar/angular2-cookie#readme
 * @license MIT
 */
import { BaseCookieOptions, CookieOptions, CookieService } from './services';
export * from './services';
export declare const ANGULAR2_COOKIE_PROVIDERS: ({
    provide: typeof CookieOptions;
    useClass: typeof BaseCookieOptions;
} | {
    provide: typeof CookieService;
    useFactory: (options: CookieOptions) => CookieService;
    deps: typeof CookieOptions[];
})[];
export declare function cookieServiceFactory(options: CookieOptions): CookieService;
