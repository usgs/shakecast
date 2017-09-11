import { Component,
         OnInit,
         OnDestroy } from '@angular/core';

import { TitleService } from '../../../title/title.service';
import { UsersService } from '../../../shakecast-admin/pages/users/users.service'

@Component({
  selector: 'user-profile',
  templateUrl: 'app/shakecast/pages/user-profile/user-profile.component.html',
  styleUrls: ['app/shakecast/pages/user-profile/user-profile.component.css']
})
export class UserProfileComponent implements OnInit, OnDestroy {
    public user: any = null;
    private subscriptions: any[] = [];
    constructor(public usersService: UsersService,
                private titleService: TitleService) {}

    ngOnInit() {
        this.titleService.title.next('User Profile')
        this.subscriptions.push(this.usersService.userData.subscribe(users => {
            this.user = users[0]
        }));

        this.usersService.getCurrentUser();
    }

    ngOnDestroy() {
        this.endSubscriptions()
    }

    endSubscriptions() {
        for (var sub in this.subscriptions) {
            this.subscriptions[sub].unsubscribe()
        }
    }
}