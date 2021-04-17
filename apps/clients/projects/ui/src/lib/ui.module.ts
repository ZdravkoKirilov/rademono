import { NgModule } from '@angular/core';
import { FeedbackModule } from './feedback/feedback.module';

import { IconsModule } from './icons/icons.module';
import { UiProviderComponent } from './ui-provider.component';

@NgModule({
  declarations: [UiProviderComponent],
  imports: [IconsModule, FeedbackModule],
  exports: [UiProviderComponent, IconsModule, FeedbackModule],
})
export class UiModule {}
