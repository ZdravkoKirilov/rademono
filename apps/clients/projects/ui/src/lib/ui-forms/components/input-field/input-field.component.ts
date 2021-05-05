import { Component, Input } from '@angular/core';

type State = 'loading' | 'error' | 'success' | '';

@Component({
  selector: 'ui-input-field',
  templateUrl: './input-field.component.html',
  styleUrls: ['./input-field.component.scss'],
})
export class InputFieldComponent {
  @Input() state: State;

  @Input() feedbackTxt: string;
}
