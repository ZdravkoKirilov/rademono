import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

type State = 'loading' | 'error' | 'success' | '';
type SimpleFunc = () => void;
@Component({
  selector: 'ui-input-field',
  templateUrl: './input-field.component.html',
  styleUrls: ['./input-field.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputFieldComponent),
      multi: true,
    },
  ],
  host: {
    '(change)': '_onChange($event.target.value)',
    '(blur)': '_onTouched($event.target.name)',
  },
})
export class InputFieldComponent implements ControlValueAccessor {
  @Input() state: State;
  @Input() feedbackTxt: string;
  @Input() name: string;
  @Input() inputType = 'text';
  @Input() value: string;
  @Input() disabled: boolean;

  _onChange: SimpleFunc;
  _onTouched: SimpleFunc;

  writeValue(newValue: string) {
    this.value = newValue;
  }

  registerOnChange(fn: SimpleFunc) {
    this._onChange = fn;
  }
  registerOnTouched(fn: SimpleFunc) {
    this._onTouched = fn;
  }

  setDisabledState(isDisabled: boolean) {
    this.disabled = isDisabled;
  }
}
