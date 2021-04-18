import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, switchMap } from 'rxjs/operators';
import { throwError, Observable, of } from 'rxjs';

import {
  ClassType,
  parseAndValidateUnknown,
  switchMapEither,
  toRightObs,
  Url,
} from '@end/global';
import { LocalStorageService } from '../storage';

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
  constructor(private http: HttpClient, private storage: LocalStorageService) {}

  private createDefaultHeaders(overrides: Record<string, string> = {}) {
    let headers = new HttpHeaders();
    const token = this.storage.getToken();

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
          (err) => throwError(err),
          (value) => of(value),
        ),
        catchError((err: HttpErrorResponse) => {
          return throwError(err);
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
          (err) => throwError(err),
          (value) => of(value),
        ),
        catchError((err: HttpErrorResponse) => {
          return throwError(err);
        }),
      );
  }
}
