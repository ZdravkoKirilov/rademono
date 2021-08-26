import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Injectable } from '@angular/core';

import {
  catchError,
  ClassType,
  Observable,
  of,
  parseAndValidateManyUnknown,
  parseAndValidateUnknown,
  switchMap,
  switchMapEither,
  toRightObs,
  Url,
  throwError,
} from '@end/global';
import { TokenService } from '../token/token.service';

type BaseParams<Value> = {
  url: Url;
  responseShape?: ClassType<Value>;
};

type ParamsWithPayload<Value> = BaseParams<Value> & {
  data: unknown;
};

@Injectable({
  providedIn: 'root',
})
export class BaseHttpService {
  constructor(private http: HttpClient, private tokenService: TokenService) {}

  private createDefaultHeaders(overrides: Record<string, string> = {}) {
    let headers = new HttpHeaders();
    const token = this.tokenService.getToken();

    if (token) {
      headers = headers.append('Authorization', token);
    }

    Object.entries(overrides).forEach(([key, value]) => {
      headers = headers.append(key, value);
    });

    return headers;
  }

  post<Value>(params: ParamsWithPayload<Value>): Observable<Value> {
    const headers = this.createDefaultHeaders();

    return this.http
      .post<Value>(params.url, params.data, { headers })
      .pipe(
        switchMap((value) => {
          if (params.responseShape) {
            return parseAndValidateUnknown(value, params.responseShape);
          }
          return toRightObs(value);
        }),
        switchMapEither(
          (err) => throwError(() => err),
          (value) => of(value),
        ),
        catchError((err: HttpErrorResponse) => {
          return throwError(() => err);
        }),
      );
  }

  get<Value>(params: BaseParams<Value>): Observable<Value> {
    const headers = this.createDefaultHeaders();

    return this.http
      .get<Value>(params.url, { headers })
      .pipe(
        switchMap((value) => {
          if (params.responseShape) {
            return parseAndValidateUnknown(value, params.responseShape);
          }
          return toRightObs(value);
        }),
        switchMapEither(
          (err) => throwError(() => err),
          (value) => of(value),
        ),
        catchError((err: HttpErrorResponse) => {
          return throwError(() => err);
        }),
      );
  }

  getMany<Value>(params: BaseParams<Value>): Observable<Value[]> {
    const headers = this.createDefaultHeaders();

    return this.http
      .get<Value[]>(params.url, { headers })
      .pipe(
        switchMap((value) => {
          if (params.responseShape) {
            return parseAndValidateManyUnknown(value, params.responseShape);
          }
          return toRightObs(value);
        }),
        switchMapEither(
          (err) => throwError(() => err),
          (value) => of(value),
        ),
        catchError((err: HttpErrorResponse) => {
          return throwError(() => err);
        }),
      );
  }
}
