/**
 * angular2-cookie - Implementation of Angular 1.x $cookies service to Angular 2
 * @version v1.2.6
 * @link https://github.com/salemdar/angular2-cookie#readme
 * @license MIT
 */
import { CookieOptions } from './base-cookie-options';
import { CookieOptionsArgs } from './cookie-options-args.model';
export declare class CookieService implements ICookieService {
    private _defaultOptions;
    protected cookieString: string;
    constructor(_defaultOptions?: CookieOptions);
    /**
     * @name CookieService#get
     *
     * @description
     * Returns the value of given cookie key.
     *
     * @param {string} key Id to use for lookup.
     * @returns {string} Raw cookie value.
     */
    get(key: string): string;
    /**
     * @name CookieService#getObject
     *
     * @description
     * Returns the deserialized value of given cookie key.
     *
     * @param {string} key Id to use for lookup.
     * @returns {Object} Deserialized cookie value.
     */
    getObject(key: string): Object;
    /**
     * @name CookieService#getAll
     *
     * @description
     * Returns a key value object with all the cookies.
     *
     * @returns {Object} All cookies
     */
    getAll(): Object;
    /**
     * @name CookieService#put
     *
     * @description
     * Sets a value for given cookie key.
     *
     * @param {string} key Id for the `value`.
     * @param {string} value Raw value to be stored.
     * @param {CookieOptionsArgs} options (Optional) Options object.
     */
    put(key: string, value: string, options?: CookieOptionsArgs): void;
    /**
     * @name CookieService#putObject
     *
     * @description
     * Serializes and sets a value for given cookie key.
     *
     * @param {string} key Id for the `value`.
     * @param {Object} value Value to be stored.
     * @param {CookieOptionsArgs} options (Optional) Options object.
     */
    putObject(key: string, value: Object, options?: CookieOptionsArgs): void;
    /**
     * @name CookieService#remove
     *
     * @description
     * Remove given cookie.
     *
     * @param {string} key Id of the key-value pair to delete.
     * @param {CookieOptionsArgs} options (Optional) Options object.
     */
    remove(key: string, options?: CookieOptionsArgs): void;
    /**
     * @name CookieService#removeAll
     *
     * @description
     * Remove all cookies.
     */
    removeAll(): void;
    private _cookieReader();
    private _cookieWriter();
    private _safeDecodeURIComponent(str);
    private _buildCookieString(name, value, options?);
    private _mergeOptions(defaultOpts, providedOpts?);
    private isBlank(obj);
    private isPresent(obj);
    private isString(obj);
}
export interface ICookieService {
    get(key: string): string;
    getObject(key: string): Object;
    getAll(): Object;
    put(key: string, value: string, options?: CookieOptionsArgs): void;
    putObject(key: string, value: Object, options?: CookieOptionsArgs): void;
    remove(key: string, options?: CookieOptionsArgs): void;
    removeAll(): void;
}
