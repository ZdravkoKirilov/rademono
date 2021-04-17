import { Injectable } from '@angular/core';

import { SendCodeDto, SignInDto, TokenDto } from '@end/global';

import { BaseHttpService, endpoints, useQuery } from '@games-admin/shared';

@Injectable()
export class AuthService {
  constructor(private http: BaseHttpService) {}

  public requestLoginCode(dto: SendCodeDto) {
    return useQuery<void, unknown>(() =>
      this.http.post({
        url: endpoints.requestAuthCode,
        data: dto,
      }),
    );
  }

  /*   this.doGosho(data) {
    return this.data$.pipe(
      take(1),
      tap(currentCache => {
        this.data$.next(data); // optimistic update
        return this.useEffect(() => this.pesho(data)).pipe(
          revertOnFail({ cache$: this.data$, fn: (cache) => {this.data$.next(currentCache)}}) // revert optimistic update
        );
      })
    )
  } */

  public requestToken(dto: SignInDto) {
    return useQuery<TokenDto, unknown>(() =>
      this.http.post({
        url: endpoints.requestAuthToken,
        data: dto,
      }),
    );
  }
}
