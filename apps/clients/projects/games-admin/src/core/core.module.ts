import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UiModule, ThemingModule } from '@libs/ui';
import { AuthModule } from '@games-admin/auth';

@NgModule({
  declarations: [],
  imports: [CommonModule, UiModule, ThemingModule.forRoot(), AuthModule],
  exports: [UiModule, ThemingModule, AuthModule],
})
export class CoreModule {}
