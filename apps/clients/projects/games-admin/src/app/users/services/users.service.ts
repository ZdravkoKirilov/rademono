import { Injectable } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';

import { AdminUser, SignInDto } from '@end/global';
import {
  AppRouterService,
  BaseHttpService,
  endpoints,
  LocalStorageService,
  QueryStatus,
  useQuery,
} from '@games-admin/shared';
import { AuthService } from '../auth/services/auth.service';
@Injectable({
  providedIn: 'root',
})
export class UsersService {
  constructor(
    private http: BaseHttpService,
    private authService: AuthService,
    private router: AppRouterService,
    private storage: LocalStorageService,
  ) {}

  private _user$ = new BehaviorSubject<AdminUser | null>(null);

  user$ = this._user$.asObservable();

  fetchUser() {
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
    return this.authService.requestToken(dto).pipe(
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
    this.router.goToLogin();
  }
}
