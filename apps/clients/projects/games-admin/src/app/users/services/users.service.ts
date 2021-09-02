import { Injectable } from '@angular/core';

import {
  PublicUser,
  BehaviorSubject,
  Observable,
  of,
  SendCodeDto,
  SignInDto,
  switchMap,
  tap,
  AccessTokenDto,
} from '@end/global';
import {
  AppRouterService,
  BaseHttpService,
  endpoints,
  QueryResponse,
  QueryStatus,
  TokenService,
  useQuery,
  valueToQueryResponse,
} from '@games-admin/shared';
import { RequestError } from '@libs/ui';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  constructor(
    private http: BaseHttpService,
    private router: AppRouterService,
    private tokenService: TokenService,
  ) {}

  private _user$ = new BehaviorSubject<PublicUser | null>(null);

  user$ = this._user$.asObservable();

  shouldRefresh = true;

  private userQuery$: Observable<
    QueryResponse<PublicUser | null, RequestError>
  > | null;

  getOrFetchUser(): Observable<QueryResponse<PublicUser | null, RequestError>> {
    this.userQuery$ =
      this.userQuery$ ||
      this.user$.pipe(
        switchMap((user) => {
          if (user) {
            return valueToQueryResponse(user);
          }

          return this.fetchUser().pipe(
            switchMap((res) => {
              return res.status === 'loaded'
                ? valueToQueryResponse(res.data)
                : valueToQueryResponse(null);
            }),
          );
        }),
      );

    return this.userQuery$;
  }

  private fetchUser() {
    return useQuery<PublicUser, RequestError>(() =>
      this.http.get({
        url: endpoints.getCurrentUser,
        responseShape: PublicUser,
      }),
    ).pipe(
      tap((res) => {
        if (res.status === 'loaded') {
          this._user$.next(res.data);
        }
      }),
    );
  }

  loginWithCode(dto: SignInDto) {
    return this.requestToken(dto).pipe(
      switchMap((res) => {
        if (res.status === QueryStatus.loaded) {
          this.tokenService.saveToken(res.data.token);
          return this.fetchUser();
        }
        return of(res);
      }),
    );
  }

  loginWithRefreshToken() {
    return this.http
      .get({
        url: endpoints.refreshAuthToken,
        responseShape: AccessTokenDto,
        withCredentials: true,
      })
      .pipe(
        tap((data) => {
          this.tokenService.saveToken(data.token);
          this.router.goToHome();
        }),
      );
  }

  logout() {
    return this.http.get({ url: endpoints.logout }).pipe(
      tap(() => {
        this.tokenService.removeToken();
        this._user$.next(null);
        this.shouldRefresh = false;
        this.router.goToLogin();
      }),
    );
  }

  requestLoginCode(dto: SendCodeDto) {
    return useQuery<void, RequestError>(() =>
      this.http.post({
        url: endpoints.requestAuthCode,
        data: dto,
      }),
    );
  }

  private requestToken(dto: SignInDto) {
    return useQuery<AccessTokenDto, RequestError>(() =>
      this.http.post({
        url: endpoints.requestAuthToken,
        data: dto,
      }),
    );
  }
}
