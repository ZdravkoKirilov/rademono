import { NgModule } from '@angular/core';

import { IconsModule } from './icons/icons.module';
import { UiProviderComponent } from './ui-provider.component';

@NgModule({
  declarations: [UiProviderComponent],
  imports: [IconsModule],
  exports: [UiProviderComponent, IconsModule],
})
export class UiModule {}
