import { NgModule } from '@angular/core';

import { ButtonsModule } from './buttons';
import { FeedbackModule } from './feedback/feedback.module';
import { IconsModule } from './icons/icons.module';
import { TextEditorModule } from './text-editor';
import { UiProviderComponent } from './ui-provider.component';

@NgModule({
  declarations: [UiProviderComponent],
  imports: [IconsModule, FeedbackModule, TextEditorModule, ButtonsModule],
  exports: [
    UiProviderComponent,
    IconsModule,
    FeedbackModule,
    TextEditorModule,
    ButtonsModule,
  ],
})
export class UiModule {}
