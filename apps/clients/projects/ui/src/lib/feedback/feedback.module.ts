import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SuccessComponent } from './success/success.component';
import { IconsModule } from '../icons';
import { ErrorComponent } from './error/error.component';
import { WarningComponent } from './warning/warning.component';

@NgModule({
  declarations: [SuccessComponent, ErrorComponent, WarningComponent],
  imports: [CommonModule, IconsModule],
  exports: [SuccessComponent, ErrorComponent, WarningComponent],
})
export class FeedbackModule {}
