import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';

import { PrivateAdminUser, SendCodeDto, mapEither } from '@end/global';
import { OnChange } from '@end/client';

import { AuthService } from '../../services/auth.service';
import { AutoUnsubscribe, QueryResponse } from '@games-admin/shared';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss'],
  host: { class: 'full-container centered-container' },
})
@AutoUnsubscribe()
export class SigninComponent {
  error?: string;
  dto?: SendCodeDto;

  constructor(private authService: AuthService) {}

  requestLoginCode$: Subscription;
  codeQuery: QueryResponse<void, unknown>;

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

  /*   onClick() {
    this.pesho$ = useConfirm(this.peshoService.dostuff);
  } */

  submit(event: Event) {
    event.preventDefault();

    if (this.dto) {
      this.requestLoginCode$ = this.authService
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
