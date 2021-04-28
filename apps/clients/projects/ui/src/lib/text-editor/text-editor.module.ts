import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuillModule } from 'ngx-quill';

import { TextEditorComponent } from './text-editor.component';

@NgModule({
  declarations: [TextEditorComponent],
  imports: [CommonModule, QuillModule.forRoot()],
  exports: [TextEditorComponent, QuillModule],
})
export class TextEditorModule {}
