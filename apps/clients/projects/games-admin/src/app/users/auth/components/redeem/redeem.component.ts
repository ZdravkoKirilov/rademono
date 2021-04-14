import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';

import { OnChange } from '@end/client';
import { mapEither, PrivateAdminUser, SignInDto, TokenDto } from '@end/global';
import { QueryResponse } from '@games-admin/shared';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-redeem',
  templateUrl: './redeem.component.html',
  styleUrls: ['./redeem.component.scss'],
  host: { class: 'full-container centered-container' },
})
export class RedeemComponent {
  error?: string;
  dto?: SignInDto;

  constructor(private authService: AuthService) {}

  sendCode$: Subscription;
  sendCodeQuery: QueryResponse<TokenDto, unknown>;

  @OnChange<unknown, RedeemComponent>(function (value, self) {
    PrivateAdminUser.toSignInDto({ code: value })
      .pipe(
        mapEither(
          () => {
            self.dto = undefined;
            self.error = 'Invalid code';
          },
          (value) => {
            self.error = undefined;
            self.dto = value;
          },
        ),
      )
      .subscribe();
  })
  code: string;

  submit(event: Event) {
    event.preventDefault();

    if (this.dto) {
      this.sendCode$ = this.authService
        .requestToken(this.dto)
        .pipe(
          tap((res) => {
            this.sendCodeQuery = res;
          }),
        )
        .subscribe();
    }
  }
}
