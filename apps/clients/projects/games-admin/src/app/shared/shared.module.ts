import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';

import { UiModule } from '@libs/ui';
import { NavbarComponent } from './components/navbar/navbar.component';
import { TranslationModule } from '@games-admin/translation';

@NgModule({
  declarations: [NavbarComponent],
  imports: [CommonModule, TranslateModule, TranslationModule, RouterModule],
  exports: [
    TranslateModule,
    TranslationModule,
    CommonModule,
    UiModule,
    NavbarComponent,
  ],
})
export class SharedModule {}
