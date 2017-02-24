/**
 * angular2-cookie - Implementation of Angular 1.x $cookies service to Angular 2
 * @version v1.2.6
 * @link https://github.com/salemdar/angular2-cookie#readme
 * @license MIT
 */
import { CookieOptionsArgs } from './cookie-options-args.model';
/** @private */
export declare class CookieOptions {
    path: string;
    domain: string;
    expires: string | Date;
    secure: boolean;
    constructor({path, domain, expires, secure}?: CookieOptionsArgs);
    merge(options?: CookieOptionsArgs): CookieOptions;
    private isPresent(obj);
}
/** @private */
export declare class BaseCookieOptions extends CookieOptions {
    private baseHref;
    constructor(baseHref: string);
}
