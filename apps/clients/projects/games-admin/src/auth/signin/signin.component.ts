import { ChangeDetectionStrategy, Component } from '@angular/core';

import { OnChange } from '@end/client';
import { AdminUser } from '@end/global';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'full-container centered-container' },
})
export class SigninComponent {
  error: string;

  @OnChange<unknown>(function (value) {
    console.log(AdminUser.isValidEmail(value));
  })
  email: string;
}
