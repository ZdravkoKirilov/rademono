import { Injectable } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';

import { AdminUser, SendCodeDto, SignInDto, TokenDto } from '@end/global';
import {
  AppRouterService,
  BaseHttpService,
  endpoints,
  LocalStorageService,
  QueryStatus,
  useQuery,
  valueToQueryResponse,
} from '@games-admin/shared';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  constructor(
    private http: BaseHttpService,
    private router: AppRouterService,
    private storage: LocalStorageService,
  ) {}

  private _user$ = new BehaviorSubject<AdminUser | null>(null);

  user$ = this._user$.asObservable();

  getOrFetchUser() {
    return this.user$.pipe(
      switchMap((user) => {
        const token = this.storage.getToken();

        if (user) {
          return valueToQueryResponse(user);
        }

        if (token) {
          return valueToQueryResponse(null);
        }

        return this.fetchUser();
      }),
    );
  }

  private fetchUser() {
    return useQuery(() =>
      this.http.get({
        url: endpoints.getCurrentUser,
        responseShape: AdminUser,
      }),
    ).pipe(
      tap((res) => {
        if (res.status === 'loaded') {
          this._user$.next(res.data);
        }
      }),
    );
  }

  login(dto: SignInDto) {
    return this.requestToken(dto).pipe(
      switchMap((res) => {
        if (res.status === QueryStatus.loaded) {
          this.storage.saveToken(res.data.token);
          console.log('token saved!');
          return this.fetchUser();
        }
        return of(res);
      }),
    );
  }

  logout(invalidateToken = false) {
    this.storage.removeToken();
    this._user$.next(null);
    this.router.goToLogin();
  }

  requestLoginCode(dto: SendCodeDto) {
    return useQuery<void, unknown>(() =>
      this.http.post({
        url: endpoints.requestAuthCode,
        data: dto,
      }),
    );
  }

  requestToken(dto: SignInDto) {
    return useQuery<TokenDto, unknown>(() =>
      this.http.post({
        url: endpoints.requestAuthToken,
        data: dto,
      }),
    );
  }
}
