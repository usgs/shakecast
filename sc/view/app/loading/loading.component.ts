import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { LoadingService } from './loading.service'

@Component({
    selector: 'loading-comp',
    templateUrl: 'app/loading/loading.component.html',
    styleUrls: ['app/loading/loading.component.css']
})
export class LoadingComponent implements OnInit, OnDestroy {
    private subscriptions: any[] = [];
    constructor(public loadingService: LoadingService,
                private ref: ChangeDetectorRef) {}

    ngOnInit() {
        this.subscriptions.push(this.loadingService.update.subscribe((update: any) => {
            this.ref.detectChanges();
        }));
    }

    endSubscriptions() {
        for (var sub in this.subscriptions) {
            this.subscriptions[sub].unsubscribe();
        }
    }
    ngOnDestroy() {
        this.endSubscriptions();
    }

}