import { Component } from '@angular/core';

import { OnChange } from '@libs/ui';
import {
  AdminUser,
  mapEither,
  PrivateAdminUser,
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
  sendCodeQuery: QueryResponse<AdminUser, unknown>;

  @OnChange<unknown, RedeemComponent>(function (value, self) {
    PrivateAdminUser.toSignInDto({ code: value })
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
        .login(this.dto)
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
