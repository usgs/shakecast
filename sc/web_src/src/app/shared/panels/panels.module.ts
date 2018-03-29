import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeftPanelComponent } from './left-panel/left-panel.component';
import { RightPanelComponent } from './right-panel/right-panel.component';
import { BottomPanelComponent } from './bottom-panel/bottom-panel.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [LeftPanelComponent, RightPanelComponent, BottomPanelComponent],
  exports: [LeftPanelComponent, RightPanelComponent, BottomPanelComponent]
})
export class PanelsModule { }
