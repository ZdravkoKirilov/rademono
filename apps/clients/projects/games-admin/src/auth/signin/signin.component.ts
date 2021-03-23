import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'full-container centered-container' },
})
export class SigninComponent {}
