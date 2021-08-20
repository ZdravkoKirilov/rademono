import { Injectable } from '@angular/core';

import {
  AdminUser,
  BehaviorSubject,
  Observable,
  of,
  SendCodeDto,
  SignInDto,
  switchMap,
  tap,
  TokenDto,
} from '@end/global';
import {
  AppRouterService,
  BaseHttpService,
  endpoints,
  LocalStorageService,
  QueryResponse,
  QueryStatus,
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
    private storage: LocalStorageService,
  ) {}

  private _user$ = new BehaviorSubject<AdminUser | null>(null);

  user$ = this._user$.asObservable();

  private userQuery$: Observable<
    QueryResponse<AdminUser | null, RequestError>
  > | null;

  getOrFetchUser(): Observable<QueryResponse<AdminUser | null, RequestError>> {
    this.userQuery$ =
      this.userQuery$ ||
      this.user$.pipe(
        switchMap((user) => {
          const token = this.storage.getToken();

          if (user) {
            return valueToQueryResponse(user);
          }

          if (token) {
            return this.fetchUser();
          }

          return valueToQueryResponse(null);
        }),
      );

    return this.userQuery$;
  }

  private fetchUser() {
    return useQuery<AdminUser, RequestError>(() =>
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
    return useQuery<void, RequestError>(() =>
      this.http.post({
        url: endpoints.requestAuthCode,
        data: dto,
      }),
    );
  }

  private requestToken(dto: SignInDto) {
    return useQuery<TokenDto, RequestError>(() =>
      this.http.post({
        url: endpoints.requestAuthToken,
        data: dto,
      }),
    );
  }
}
