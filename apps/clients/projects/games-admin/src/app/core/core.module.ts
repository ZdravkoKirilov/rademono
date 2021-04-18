import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RouterModule } from '@angular/router';

import { UiModule, ThemingModule } from '@libs/ui';
import { UnauthorizedInterceptor } from '@games-admin/users/auth';

import { TranslationModule } from '../translation';
import { AppRootComponent } from './components/app-root/app-root.component';
import { CurrentUserProviderComponent } from './providers/current-user-provider/current-user-provider.component';

@NgModule({
  declarations: [AppRootComponent, CurrentUserProviderComponent],
  imports: [
    CommonModule,
    UiModule,
    ThemingModule.forRoot(),
    HttpClientModule,
    TranslationModule,
    RouterModule,
  ],
  exports: [TranslationModule, AppRootComponent],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: UnauthorizedInterceptor,
      multi: true,
    },
  ],
})
export class CoreModule {}
