import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { UserService } from '../login/user.service';
import { Observable } from "rxjs/Rx";

@Injectable()
export class LoginGuard implements CanActivate {
    constructor(private user: UserService,
                private router: Router) {}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):Observable<boolean>|boolean {
        console.log('LoginGuard#canActivate called');
        if (this.user.loggedIn) {
            return true
        }
        // not logged in so redirect to login page
        this.router.navigate(['/login']);
        return false;
    }
}