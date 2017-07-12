import { Component, Input } from '@angular/core';

@Component({
    selector: 'info',
    templateUrl: 'app/shared/info/info.component.html',
    styleUrls: ['app/shared/info/info.component.css']
})
export class InfoComponent {
    public showInfo = 'no';
    @Input() text: string;
    @Input() side: string;
}