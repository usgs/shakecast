import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { UserService } from '../login/user.service';
import { Observable } from "rxjs/Rx";
import { NotificationsService } from 'angular2-notifications'

@Injectable()
export class AdminGuard implements CanActivate {
    constructor(private user: UserService,
                private router: Router,
                private notService: NotificationsService) {}

    canActivate(route: ActivatedRouteSnapshot, 
                state: RouterStateSnapshot): Observable<boolean>|boolean {
        console.log('AdminGuard#canActivate called');
        if (this.user.isAdmin) {
            return true
        }
        // not logged in so redirect to login page
        this.notService.error('Admin', 
                              'Login as an admin to access this page', 
                              {setTimeout: 5000})
    }
}