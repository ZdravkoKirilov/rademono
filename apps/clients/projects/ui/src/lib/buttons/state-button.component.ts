import { Component, Input } from '@angular/core';

type State = 'loading' | 'error' | 'success' | '';

@Component({
  selector: 'ui-state-button',
  templateUrl: './state-button.component.html',
  styleUrls: ['./state-button.component.scss'],
})
export class StateButtonComponent {
  @Input()
  state: State;

  @Input() loadingText = 'Loading...';

  @Input() errorText = 'Failed. Try again';

  @Input() successText = 'Success';
}
