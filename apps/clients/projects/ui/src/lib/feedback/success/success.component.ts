import { Component, HostBinding, Input } from '@angular/core';

@Component({
  selector: 'ui-success',
  templateUrl: './success.component.html',
  styleUrls: ['./success.component.scss'],
  host: {
    class: 'flex flex-align-center flex-justify-center width-12 width-m-6',
    'aria-role': 'status',
  },
})
export class SuccessComponent {
  @HostBinding('class.visually-hidden') @Input() inactive = true;
}
