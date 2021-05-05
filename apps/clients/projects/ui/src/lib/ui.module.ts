import { NgModule } from '@angular/core';

import { ButtonsModule } from './buttons';
import { FeedbackModule } from './feedback/feedback.module';
import { IconsModule } from './icons/icons.module';
import { TextEditorModule } from './text-editor';
import { UiFormsModule } from './ui-forms';
import { UiProviderComponent } from './ui-provider.component';

@NgModule({
  declarations: [UiProviderComponent],
  imports: [
    IconsModule,
    FeedbackModule,
    TextEditorModule,
    ButtonsModule,
    UiFormsModule,
  ],
  exports: [
    UiProviderComponent,
    IconsModule,
    FeedbackModule,
    TextEditorModule,
    ButtonsModule,
    UiFormsModule,
  ],
})
export class UiModule {}
