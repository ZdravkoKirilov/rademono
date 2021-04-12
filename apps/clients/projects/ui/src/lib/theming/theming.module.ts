import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Theme } from './theme.model';
import { lightTheme } from './lightTheme';
import { THEMES, ThemeDirective } from './theme.directive';

export interface ThemeOptions {
  themes: Theme[];
}

@NgModule({
  declarations: [ThemeDirective],
  imports: [CommonModule],
  exports: [ThemeDirective],
})
export class ThemingModule {
  static forRoot(
    options: ThemeOptions = { themes: [lightTheme] },
  ): ModuleWithProviders<ThemingModule> {
    return {
      ngModule: ThemingModule,
      providers: [
        {
          provide: THEMES,
          useValue: options.themes,
        },
      ],
    };
  }
}
