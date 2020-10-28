
import {throwError as observableThrowError,  Observable, Subject } from 'rxjs';
// user.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';




export class User {
    constructor(
        public username: string,
        public password: string
    ) {}
}

@Injectable()
export class UserService {
  public user$ = new BehaviorSubject(null);
  public loggedIn = false;
  public isAdmin = false;
  public username = '';

  constructor(private _http: HttpClient,
              private router: Router) {}


  login(username: string, password: string) {
    return this._http.post('api/login', {username: username,
                                         password: password});
  }

   logout() {
    this._http.get('api/logout')
      .subscribe(resp => {
        this.loggedIn = false;
        this.router.navigate(['/login']);
    });
  }

  getUser() {
    this._http.get('api/users/current').subscribe((user) => {
        if (!user) {
          this.router.navigate(['/login']);
        }
        this.user$.next(user);
    });
  }

  private handleError (error: any) {
    // In a real world app, we might use a remote logging infrastructure
    // We'd also dig deeper into the error to get a better message
    let errMsg = (error.message) ? error.message :
      error.status ? `${error.status} - ${error.statusText}` : 'Server error';
    console.error(errMsg); // log to console instead
    return observableThrowError(errMsg);
  }
}
