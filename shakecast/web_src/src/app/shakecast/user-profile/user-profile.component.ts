import { Component,
         OnInit,
         OnDestroy } from '@angular/core';

import { TitleService } from '@core/title.service';
import { UsersService } from '@core/users.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit, OnDestroy {
    public user: any = null;
    private subs = new Subscription();

    constructor(public usersService: UsersService,
                private titleService: TitleService) {}

    ngOnInit() {
        this.titleService.title.next('User Profile');
        this.subs.add(this.usersService.userData.subscribe(users => {
            this.user = users[0];
        }));

        this.usersService.getCurrentUser();
    }

    ngOnDestroy() {
        this.endSubscriptions();
    }

    endSubscriptions() {
        this.subs.unsubscribe();
    }
}
