import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { UserService } from '@core/user.service';
import { Observable } from "rxjs";
import { NotificationsService } from 'angular2-notifications';

@Injectable()
export class AdminGuard implements CanActivate {
    constructor(private user: UserService,
                private router: Router,
                private notService: NotificationsService) {}

    canActivate(route: ActivatedRouteSnapshot,
                state: RouterStateSnapshot): Observable<boolean>|boolean {
        console.log('AdminGuard#canActivate called');
        if (this.user.user$.value.user_type === 'ADMIN') {
            return true;
        }
        // not logged in so redirect to login page
        this.notService.error('Admin',
                              'Login as an admin to access this page',
                              {setTimeout: 5000});
        this.router.navigate(['/shakecast/dashboard']);
    }
}