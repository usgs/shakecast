import { Component,
         OnInit,
         OnDestroy} from '@angular/core';

import { Subscription } from 'rxjs';

import { UpdateService } from './update.service';

@Component({
  selector: 'update',
  templateUrl: './update.component.html',
  styleUrls: ['./update.component.css']
})
export class UpdateComponent implements OnInit, OnDestroy {
    private subscriptions = new Subscription();
    public info: any = null;

    constructor(private updateService: UpdateService) {}

    ngOnInit() {
        this.subscriptions.add(this.updateService.info.subscribe((info: any) => {
            this.info = info;
        }));

        this.updateService.getData();
    }

    update() {
        this.info['required'] = false;
        this.updateService.updateShakecast();
    }

    close() {
        this.info['required'] = false;
    }

    ngOnDestroy() {
        this.endSubscriptions();
    }

    endSubscriptions() {
        this.subscriptions.unsubscribe();
    }
}
