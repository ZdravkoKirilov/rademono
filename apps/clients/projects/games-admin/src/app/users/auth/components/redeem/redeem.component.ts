import { Component } from '@angular/core';

import { OnChange } from '@libs/ui';
import {
  PublicUser,
  mapEither,
  User,
  SignInDto,
  Subscription,
  tap,
} from '@end/global';
import {
  AppRouterService,
  QueryResponse,
  QueryStatus,
} from '@games-admin/shared';
import { UsersService } from '../../../services/users.service';

@Component({
  selector: 'app-redeem',
  templateUrl: './redeem.component.html',
  styleUrls: ['./redeem.component.scss'],
  host: { class: 'full-container' },
})
export class RedeemComponent {
  dto?: SignInDto;

  constructor(
    private usersService: UsersService,
    private appRouter: AppRouterService,
  ) {}

  sendCode$: Subscription;
  sendCodeQuery: QueryResponse<PublicUser, unknown>;

  @OnChange<unknown, RedeemComponent>(function (value, self) {
    User.toSignInDto({ code: value })
      .pipe(
        mapEither(
          () => {
            self.dto = undefined;
          },
          (value) => {
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
      this.sendCode$ = this.usersService
        .loginWithCode(this.dto)
        .pipe(
          tap((res) => {
            this.sendCodeQuery = res;

            if (res.status === QueryStatus.loaded) {
              this.appRouter.goToHome();
            }
          }),
        )
        .subscribe();
    }
  }
}
