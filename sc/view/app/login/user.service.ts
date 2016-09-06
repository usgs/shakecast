// user.service.ts
import { Injectable } from 'angular2/core';
import { Http, Headers } from 'angular2/http';
import 'rxjs/add/operator/map';

@Injectable()
export class UserService {
  private loggedIn = false;

  constructor(private _http: Http) {
    this.isLoggedIn()
  }

  login(username, password) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this._http.post('/login', 
                          JSON.stringify({username: username,
                                         password: password}), 
                          {headers}
                    )
              .map(res => res.json())
              .map((res) => {
                  if (res.success) {
                      localStorage.setItem('auth_token', res.auth_token);
                      this.loggedIn = true;
                  }
                return res.success;
              });
  }
  
  logout() {
    this._http.get('/logout');
    this.loggedIn = false;
  }

  isLoggedIn() {
    this._http.get('/logged_in')
                  .map(res => res.json())
                  .map((res) => {
                      this.loggedIn = res.success
                  });
    return this.loggedIn;
  }
}