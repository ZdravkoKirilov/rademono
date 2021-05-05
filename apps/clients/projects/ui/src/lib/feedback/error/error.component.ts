import { Component, HostBinding, Input } from '@angular/core';

@Component({
  selector: 'ui-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.scss'],
  host: {
    class: 'block',
    'aria-role': 'status',
  },
})
export class ErrorComponent {
  @HostBinding('class.visually-hidden') @Input() inactive = true;

  @Input() variation: 'standard' | 'form' = 'standard';
}
