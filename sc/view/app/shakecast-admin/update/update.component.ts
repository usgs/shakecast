import { Component, 
         OnInit,
         OnDestroy} from '@angular/core';

import { UpdateService } from './update.service';

@Component({
  selector: 'update',
  templateUrl: 'app/shakecast-admin/update/update.component.html',
  styleUrls: ['app/shakecast-admin/update/update.component.css']
})
export class UpdateComponent implements OnInit, OnDestroy {
    private subscriptions: any[] = [];
    public info: any = null;

    constructor(private updateService: UpdateService) {}

    ngOnInit() {        
        this.subscriptions.push(this.updateService.info.subscribe((info: any) => {
            this.info = info
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
        this.endSubscriptions()
    }

    endSubscriptions() {
        for (var sub in this.subscriptions) {
            this.subscriptions[sub].unsubscribe()
        }
    }
}