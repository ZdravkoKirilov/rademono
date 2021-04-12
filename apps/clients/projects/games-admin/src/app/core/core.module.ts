import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

import { UiModule, ThemingModule } from '@libs/ui';
import { UsersModule } from '../users';
import { TranslationModule } from '../translation';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    UiModule,
    ThemingModule.forRoot(),
    UsersModule,
    HttpClientModule,
    TranslationModule,
  ],
  exports: [UiModule, ThemingModule, UsersModule, TranslationModule],
})
export class CoreModule {}
