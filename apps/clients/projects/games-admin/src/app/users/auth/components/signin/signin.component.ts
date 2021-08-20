import { Component } from '@angular/core';

import { User, SendCodeDto, mapEither, Subscription, tap } from '@end/global';
import { OnChange } from '@libs/ui';
import { AutoUnsubscribe, QueryResponse } from '@games-admin/shared';

import { UsersService } from '../../../services/users.service';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss'],
  host: { class: 'full-container' },
})
@AutoUnsubscribe()
export class SigninComponent {
  error?: string;
  dto?: SendCodeDto;

  constructor(private userService: UsersService) {}

  requestLoginCode$: Subscription;
  codeQuery: QueryResponse<void, unknown>;

  @OnChange<unknown, SigninComponent>(function (value, self) {
    User.toSendCodeDto({ email: value })
      .pipe(
        mapEither(
          () => {
            self.dto = undefined;
            self.error = value ? 'Invalid email' : '';
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

    if (this.dto) {
      this.requestLoginCode$ = this.userService
        .requestLoginCode(this.dto)
        .pipe(
          tap((res) => {
            this.codeQuery = res;
          }),
        )
        .subscribe();
    }
  }
}
