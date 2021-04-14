import { Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'lib-ui-provider',
  template: `<ng-content></ng-content>`,
  styleUrls: ['./ui-provider.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class UiProviderComponent {}
