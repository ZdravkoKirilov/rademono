import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from '@end/global';

import { UsersService } from '../../../services/users.service';

@Injectable({
  providedIn: 'root',
})
export class UnauthorizedInterceptor implements HttpInterceptor {
  constructor(private userService: UsersService) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((err) => {
        if (err instanceof HttpErrorResponse && err.status === 401) {
          this.userService.logout();
        }
        return throwError(err);
      }),
    );
  }
}
