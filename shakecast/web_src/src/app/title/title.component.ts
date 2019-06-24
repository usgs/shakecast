import { Component, 
         OnInit,
         OnDestroy,
        ChangeDetectorRef} from '@angular/core';

import { TitleService } from '@core/title.service';

@Component({
  selector: 'page-title',
  templateUrl: './title.component.html',
  styleUrls: ['./title.component.css']
})
export class TitleComponent implements OnInit, OnDestroy {
    private subscriptions: any[] = []
    public title: string = ''

    constructor(private titleService: TitleService,
                private cdr: ChangeDetectorRef) {}

    ngOnInit() {        
        this.subscriptions.push(this.titleService.title.subscribe((title: string) => {
            this.title = title
            this.cdr.detectChanges();
        }));}
    
    ngOnDestroy() {
        this.endSubscriptions()
    }

    endSubscriptions() {
        for (var sub in this.subscriptions) {
            this.subscriptions[sub].unsubscribe()
        }
    }
}