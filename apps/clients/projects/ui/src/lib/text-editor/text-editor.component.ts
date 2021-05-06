import { Component, forwardRef, Input, ViewEncapsulation } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ContentChange } from 'ngx-quill';

type SimpleFunc = () => void;

@Component({
  selector: 'ui-text-editor',
  templateUrl: './text-editor.component.html',
  styleUrls: ['./text-editor.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextEditorComponent),
      multi: true,
    },
  ],
  host: {
    '(onBlur)': '_onTouched($event.target.name)',
  },
})
export class TextEditorComponent implements ControlValueAccessor {
  @Input() value: string | null;
  @Input() disabled: boolean;
  @Input() name: string;

  config = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      [{ color: [] }, { background: [] }],
      ['link'],
      ['clean'],
    ],
  };

  handleChange(data: ContentChange) {
    this._onChange(data.html);
  }

  _onChange: (value: string | null) => void;
  _onTouched: SimpleFunc;

  writeValue(newValue: string | null) {
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
