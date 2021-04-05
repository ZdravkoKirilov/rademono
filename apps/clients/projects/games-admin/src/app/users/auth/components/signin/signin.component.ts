import { ChangeDetectionStrategy, Component } from '@angular/core';

import { PrivateAdminUser, SendCodeDto, mapEither } from '@end/global';
import { OnChange } from '@end/client';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'full-container centered-container' },
})
export class SigninComponent {
  error?: string;
  dto?: SendCodeDto;

  @OnChange<unknown, SigninComponent>(function (value, self) {
    PrivateAdminUser.toSendCodeDto({ email: value })
      .pipe(
        mapEither(
          () => {
            self.dto = undefined;
            self.error = 'Invalid email';
          },
          (value) => {
            self.error = undefined;
            self.dto = value;
          },
        ),
      )
      .subscribe();
  })
  email: string;

  submit(event: Event) {
    event.preventDefault();
    console.log(this.dto);
  }
}
