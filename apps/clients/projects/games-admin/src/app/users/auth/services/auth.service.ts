import { Injectable } from '@angular/core';
import { tap } from 'rxjs/operators';

import { JWT, SendCodeDto, SignInDto, TokenDto } from '@end/global';

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

  private saveToken(token: JWT) {
    this.storage.set('token', token);
  }

  public requestLoginCode(dto: SendCodeDto) {
    return useQuery(() =>
      this.http.post({
        url: endpoints.requestAuthCode,
        data: dto,
        withAuthentication: false,
      }),
    );
  }

  public requestToken(dto: SignInDto) {
    return useQuery<TokenDto, unknown>(() =>
      this.http.post({
        url: endpoints.requestAuthToken,
        data: dto,
        withAuthentication: false,
      }),
    ).pipe(
      tap((result) => {
        if (result.status === QueryStatus.loaded) {
          this.saveToken(result.data.token);
        }
        return result;
      }),
    );
  }

  public getToken() {
    return this.storage.get('token');
  }
}
