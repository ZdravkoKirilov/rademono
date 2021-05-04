import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StateButtonComponent } from './state-button.component';
import { IconsModule } from '../icons';

@NgModule({
  declarations: [StateButtonComponent],
  imports: [CommonModule, IconsModule],
  exports: [StateButtonComponent],
})
export class ButtonsModule {}
