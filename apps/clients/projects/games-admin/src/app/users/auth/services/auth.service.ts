import { Injectable } from '@angular/core';
import { tap } from 'rxjs/operators';

import { SendCodeDto, SignInDto, TokenDto } from '@end/global';

import {
  BaseHttpService,
  LocalStorageService,
  endpoints,
  useQuery,
  QueryStatus,
} from '@games-admin/shared';

@Injectable()
export class AuthService {
  constructor(
    private storage: LocalStorageService,
    private http: BaseHttpService,
  ) {}

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
    ).pipe(
      tap((result) => {
        if (result.status === QueryStatus.loaded) {
          this.storage.saveToken(result.data.token);
        }
        return result;
      }),
    );
  }
}
