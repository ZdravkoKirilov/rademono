import { NgModule } from '@angular/core';
import { FeedbackModule } from './feedback/feedback.module';

import { IconsModule } from './icons/icons.module';
import { TextEditorModule } from './text-editor';
import { UiProviderComponent } from './ui-provider.component';

@NgModule({
  declarations: [UiProviderComponent],
  imports: [IconsModule, FeedbackModule, TextEditorModule],
  exports: [UiProviderComponent, IconsModule, FeedbackModule, TextEditorModule],
})
export class UiModule {}
