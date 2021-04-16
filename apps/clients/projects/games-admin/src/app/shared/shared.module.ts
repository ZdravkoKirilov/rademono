import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { UiModule } from '@libs/ui';

@NgModule({
  declarations: [],
  imports: [CommonModule],
  exports: [TranslateModule, CommonModule, UiModule],
})
export class SharedModule {}
