import {
  Directive,
  ElementRef,
  Inject,
  InjectionToken,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';

import { Theme } from './theme';

export const THEMES = new InjectionToken('THEMES');

@Directive({
  selector: '[theme]',
})
export class ThemeDirective implements OnChanges {
  constructor(
    private elementRef: ElementRef,
    @Inject(THEMES) private themes: Theme[],
  ) {}

  @Input()
  theme: Theme['name'];

  ngOnChanges(changes: SimpleChanges) {
    if (changes['theme'].currentValue !== changes['theme'].previousValue) {
      const theme = this.themes.find((elem) => elem.name === this.theme);
      if (theme) {
        Object.entries(theme.properties).forEach(([key, value]) => {
          this.elementRef.nativeElement.style.setProperty(key, value);
        });
      }
    }
  }
}
