// user.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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

  constructor(private _http: HttpClient,
              private router: Router) {}

  
  login(username: string, password: string) {
    return this._http.post('/api/login', {username: username,
                                         password: password},{})
  }

   logout() {
    this._http.get('/logout')
      .subscribe(resp => {
        this.loggedIn = false
        this.router.navigate(['/login'])
    });
  }

  checkLoggedIn() {
    return this._http.get('/logged_in')
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