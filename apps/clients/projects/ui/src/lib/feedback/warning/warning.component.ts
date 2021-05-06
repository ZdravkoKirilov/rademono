import { Component, HostBinding, Input } from '@angular/core';

@Component({
  selector: 'ui-warning',
  templateUrl: './warning.component.html',
  styleUrls: ['./warning.component.scss'],
  host: {
    class: 'block',
    'aria-role': 'status',
  },
})
export class WarningComponent {
  @HostBinding('class.visually-hidden') @Input() inactive = true;
}
