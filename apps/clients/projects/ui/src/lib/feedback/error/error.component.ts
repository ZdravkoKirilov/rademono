import { Component, HostBinding, Input } from '@angular/core';

@Component({
  selector: 'ui-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.scss'],
  host: {
    class: 'flex flex-align-center flex-justify-center width-12 width-m-6',
    'aria-role': 'status',
  },
})
export class ErrorComponent {
  @HostBinding('class.visually-hidden') @Input() inactive = true;
}
