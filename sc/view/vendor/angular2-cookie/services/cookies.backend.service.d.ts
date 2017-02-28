/**
 * angular2-cookie - Implementation of Angular 1.x $cookies service to Angular 2
 * @version v1.2.6
 * @link https://github.com/salemdar/angular2-cookie#readme
 * @license MIT
 */
import { CookieOptions } from './base-cookie-options';
import { CookieService } from './cookies.service';
export declare class CookieBackendService extends CookieService {
    protected cookieString: string;
    constructor(_defaultOptions?: CookieOptions);
}
