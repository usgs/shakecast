import { Component, Input } from '@angular/core';

@Component({
    selector: 'info',
    templateUrl: './info.component.html',
    styleUrls: ['./info.component.css']
})
export class InfoComponent {
    public showInfo = 'no';
    @Input() text: string;
    @Input() side: string;
}