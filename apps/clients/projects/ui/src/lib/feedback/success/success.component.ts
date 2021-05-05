import { Component, HostBinding, Input } from '@angular/core';

@Component({
  selector: 'ui-success',
  templateUrl: './success.component.html',
  styleUrls: ['./success.component.scss'],
  host: {
    class: 'block',
    'aria-role': 'status',
  },
})
export class SuccessComponent {
  @HostBinding('class.visually-hidden') @Input() inactive = true;

  @Input() variation: 'standard' | 'form' = 'standard';
}
