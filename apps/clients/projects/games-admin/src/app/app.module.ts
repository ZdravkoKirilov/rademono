import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { UiModule, ThemingModule } from '@app/ui';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, AppRoutingModule, UiModule, ThemingModule.forRoot()],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
