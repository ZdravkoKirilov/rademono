import { Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'lib-ui',
  template: `<ng-content></ng-content>`,
  styleUrls: ['./ui.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class UiComponent {}
