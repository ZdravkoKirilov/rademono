import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ThemingModule, UiModule } from '@libs/ui';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ButtonsComponent } from './buttons/buttons.component';
import { InputsComponent } from './inputs/inputs.component';

@NgModule({
  declarations: [AppComponent, ButtonsComponent, InputsComponent],
  imports: [BrowserModule, AppRoutingModule, UiModule, ThemingModule.forRoot()],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
