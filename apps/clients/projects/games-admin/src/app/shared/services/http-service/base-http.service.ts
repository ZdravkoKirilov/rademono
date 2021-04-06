import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, switchMap } from 'rxjs/operators';
import { throwError, of } from 'rxjs';
import * as e from 'fp-ts/lib/Either';

import {
  ClassType,
  mapEither,
  parseAndValidateUnknown,
  Url,
} from '@end/global';

type BaseParams = {
  url: Url;
  responseShape?: ClassType<any>;
  withAuthentication?: boolean;
};

type ParamsWithPayload = BaseParams & {
  data: unknown;
};

@Injectable({
  providedIn: 'root',
})
export class BaseHttpService {
  constructor(private http: HttpClient) {}

  get(params: BaseParams) {
    return this.http.get(params.url).pipe(
      switchMap((value) =>
        params.responseShape
          ? parseAndValidateUnknown(value, params.responseShape)
          : of(e.right(value)),
      ),
      mapEither(
        (err) => throwError(err),
        (value) => value,
      ),
      catchError((err: HttpErrorResponse) => {
        return throwError(err);
      }),
    );
  }

  put() {}

  post(params: ParamsWithPayload) {
    return this.http.post(params.url, params.data).pipe(
      switchMap((value) =>
        params.responseShape
          ? parseAndValidateUnknown(value, params.responseShape)
          : of(e.right(value)),
      ),
      mapEither(
        (err) => throwError(err),
        (value) => value,
      ),
      catchError((err: HttpErrorResponse) => {
        return throwError(err);
      }),
    );
  }

  delete() {}
}
