import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UiModule, ThemingModule } from '@libs/ui';
import { TranslationModule } from '@games-admin/translation';

import { AppRootComponent } from './components/app-root/app-root.component';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [AppRootComponent],
  imports: [
    CommonModule,
    TranslationModule,
    RouterModule,
    UiModule,
    ThemingModule.forRoot(),
  ],
  exports: [AppRootComponent, TranslationModule],
})
export class CoreModule {}
