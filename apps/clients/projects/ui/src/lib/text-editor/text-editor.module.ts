import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuillModule } from 'ngx-quill';

import { TextEditorComponent } from './text-editor.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [TextEditorComponent],
  imports: [CommonModule, QuillModule.forRoot(), FormsModule],
  exports: [TextEditorComponent, QuillModule],
})
export class TextEditorModule {}
