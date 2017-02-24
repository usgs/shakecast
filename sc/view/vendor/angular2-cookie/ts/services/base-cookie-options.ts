/**
 * angular2-cookie - Implementation of Angular 1.x $cookies service to Angular 2
 * @version v1.2.6
 * @link https://github.com/salemdar/angular2-cookie#readme
 * @license MIT
 */
import {APP_BASE_HREF} from '@angular/common';
import {Inject, Injectable, Optional} from '@angular/core';
import {CookieOptionsArgs} from './cookie-options-args.model';

/** @private */
export class CookieOptions {
  path: string;
  domain: string;
  expires: string|Date;
  secure: boolean;

  constructor({path, domain, expires, secure}: CookieOptionsArgs = {}) {
    this.path = this.isPresent(path) ? path : null;
    this.domain = this.isPresent(domain) ? domain : null;
    this.expires = this.isPresent(expires) ? expires : null;
    this.secure = this.isPresent(secure) ? secure : false;
  }

  merge(options?: CookieOptionsArgs): CookieOptions {
    return new CookieOptions(<CookieOptionsArgs>{
      path: this.isPresent(options) && this.isPresent(options.path) ? options.path : this.path,
      domain: this.isPresent(options) && this.isPresent(options.domain) ? options.domain :
                                                                          this.domain,
      expires: this.isPresent(options) && this.isPresent(options.expires) ? options.expires :
                                                                            this.expires,
      secure: this.isPresent(options) && this.isPresent(options.secure) ? options.secure :
                                                                          this.secure,
    });
  }

  private isPresent(obj: any): boolean {
    return obj !== undefined && obj !== null;
  }
}

/** @private */
@Injectable()
export class BaseCookieOptions extends CookieOptions {
  constructor(@Optional() @Inject(APP_BASE_HREF) private baseHref: string) {
    super({path: baseHref || '/'});
  }
}
