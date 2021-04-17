import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { UiModule, ThemingModule } from '@libs/ui';
import { UnauthorizedInterceptor } from '@games-admin/users/auth';

import { TranslationModule } from '../translation';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    UiModule,
    ThemingModule.forRoot(),
    HttpClientModule,
    TranslationModule,
  ],
  exports: [UiModule, ThemingModule, TranslationModule],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: UnauthorizedInterceptor,
      multi: true,
    },
  ],
})
export class CoreModule {}
