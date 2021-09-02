import {
  HttpErrorResponse,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';

import {
  catchError,
  Observable,
  switchMap,
  throwError,
  Url,
} from '@end/global';
import { endpoints } from '@games-admin/shared';

import { UsersService } from '../../../services/users.service';

const exclusions: Url[] = [endpoints.logout, endpoints.refreshAuthToken];

@Injectable({
  providedIn: 'root',
})
export class UnauthorizedInterceptor implements HttpInterceptor {
  constructor(private userService: UsersService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<any> {
    if (exclusions.includes(request.url as Url)) {
      return next.handle(request);
    }
    return next.handle(request).pipe(
      catchError((err) => {
        if (
          err instanceof HttpErrorResponse &&
          err.status === 401 &&
          this.userService.shouldRefresh
        ) {
          return this.userService.loginWithRefreshToken().pipe(
            switchMap((accessToken) => {
              const clonedRequest = request.clone({
                setHeaders: { Authorization: accessToken.token },
              });
              return next.handle(clonedRequest).pipe(
                catchError(() => {
                  return this.userService.logout();
                }),
              );
            }),
            catchError(() => {
              return this.userService.logout();
            }),
          );
        }
        return throwError(() => err);
      }),
    );
  }
}
