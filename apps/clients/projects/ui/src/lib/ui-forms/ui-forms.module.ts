import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { InputFieldComponent } from './components/input-field/input-field.component';
import { FeedbackModule } from '../feedback';

@NgModule({
  declarations: [InputFieldComponent],
  imports: [CommonModule, FeedbackModule, FormsModule],
  exports: [InputFieldComponent],
})
export class UiFormsModule {}
