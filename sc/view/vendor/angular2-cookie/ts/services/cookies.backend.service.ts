/**
 * angular2-cookie - Implementation of Angular 1.x $cookies service to Angular 2
 * @version v1.2.6
 * @link https://github.com/salemdar/angular2-cookie#readme
 * @license MIT
 */
import {Injectable, Optional} from '@angular/core';

import {CookieOptions} from './base-cookie-options';
import {CookieService} from './cookies.service';

@Injectable()
export class CookieBackendService extends CookieService {
  protected get cookieString(): string {
    return (<any>global).Zone.current.get('req').headers.cookie || '';
  }
  protected set cookieString(val: string) {
    (<any>global).Zone.current.get('req').headers.cookie = val;
    (<any>global).Zone.current.get('res').headers.cookie = val;
  }

  constructor(@Optional() _defaultOptions?: CookieOptions) {
    super(_defaultOptions);
  }
}
