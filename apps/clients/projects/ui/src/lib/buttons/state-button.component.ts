import { Component, Input } from '@angular/core';

import { NgOnChange } from '../helpers/OnChange';

type State = 'loading' | 'error' | 'success' | '';

@Component({
  selector: 'ui-state-button',
  templateUrl: './state-button.component.html',
  styleUrls: ['./state-button.component.scss'],
})
export class StateButtonComponent {
  @NgOnChange<State, StateButtonComponent>((value, self) => {
    if (value === 'success') {
      setTimeout(() => {
        self.state = '';
      }, 2000);
    }
  })
  @Input()
  state: State;

  @Input() loadingText = 'Loading...';

  @Input() errorText = 'Failed. Try again';

  @Input() successText = 'Success';
}
