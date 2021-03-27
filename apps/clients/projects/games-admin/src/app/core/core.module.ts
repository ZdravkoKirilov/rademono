import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

import { UiModule, ThemingModule } from '@libs/ui';
import { UsersModule } from '../users';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    UiModule,
    ThemingModule.forRoot(),
    UsersModule,
    HttpClientModule,
  ],
  exports: [UiModule, ThemingModule, UsersModule],
})
export class CoreModule {}
