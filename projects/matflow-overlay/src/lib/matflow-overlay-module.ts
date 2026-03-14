import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverlayModule } from '@angular/cdk/overlay';

import { MatflowPopoverDirective } from './popover/matflow-popover.directive';
import { MatflowPopoverTriggerDirective } from './popover/matflow-popover-trigger.directive';

@NgModule({
  declarations: [
    MatflowPopoverDirective,
    MatflowPopoverTriggerDirective
  ],
  imports: [
    CommonModule,
    OverlayModule
  ],
  exports: [
    MatflowPopoverDirective,
    MatflowPopoverTriggerDirective
  ]
})
export class MatflowOverlayModule { }
