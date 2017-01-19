// user.service.ts
import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { Router } from '@angular/router'
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/delay';

export class User {
    constructor(
        public username: string,
        public password: string
    ) {}
}

@Injectable()
export class UserService {
  public loggedIn = false;
  public isAdmin = false;
  public username = '';

  constructor(private _http: Http,
              private router: Router) {}

  
  login(username: string, password: string) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this._http.post('/api/login', 
                          JSON.stringify({username: username,
                                         password: password}), 
                          {headers}
                    )
              .map(res => res.json())
              .do((res) => {
                  if (res.success) {
                      this.loggedIn = true;
                      this.isAdmin = res.isAdmin
                      this.username = username
                  }
              });
  }

   logout() {
    this._http.get('/logout').map((resp: Response) => resp.json)
                          .subscribe(resp => {
                              this.loggedIn = false
                              this.router.navigate(['/login'])
                          });
  }

  checkLoggedIn() {
    return this._http.get('/logged_in')
                  .map((resp: Response) => resp.json())
                  .do(resp => this.loggedIn = resp.success)
                  .catch(this.handleError);
  }
  

  extractData(res: Response) {
    let body = res.json()
    return body.data || {}
  }

  private handleError (error: any) {
    // In a real world app, we might use a remote logging infrastructure
    // We'd also dig deeper into the error to get a better message
    let errMsg = (error.message) ? error.message :
      error.status ? `${error.status} - ${error.statusText}` : 'Server error';
    console.error(errMsg); // log to console instead
    return Observable.throw(errMsg);
  }
}