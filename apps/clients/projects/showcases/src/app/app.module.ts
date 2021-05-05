import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ThemingModule, UiModule } from '@libs/ui';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ButtonsComponent } from './buttons/buttons.component';
import { InputsComponent } from './inputs/inputs.component';
import { FeedbackComponent } from './feedback/feedback.component';
import { GlobalLoaderComponent } from './global-loader/global-loader.component';
import { FormsComponent } from './forms/forms.component';
import { TypographyComponent } from './typography/typography.component';

@NgModule({
  declarations: [
    AppComponent,
    ButtonsComponent,
    InputsComponent,
    FeedbackComponent,
    GlobalLoaderComponent,
    FormsComponent,
    TypographyComponent,
  ],
  imports: [BrowserModule, AppRoutingModule, UiModule, ThemingModule.forRoot()],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
