import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import {
  catchError,
  tap,
  switchMap,
  withLatestFrom,
  filter,
} from 'rxjs/operators';

export enum QueryStatus {
  loading = 'loading',
  error = 'error',
  loaded = 'loaded',
}

type WithRetry = Readonly<{ refire: () => void }>;

type QueryResponse<Value = unknown, Error = unknown> =
  | Readonly<{ status: QueryStatus.loading }>
  | (WithRetry & Readonly<{ status: QueryStatus.error; error: Error }>)
  | (WithRetry & Readonly<{ status: QueryStatus.loaded; data: Value }>);

@Injectable()
export class QueryService<Value> {
  data$ = new BehaviorSubject<Value | null>(null);

  useQuery<Error>(
    fn: () => Observable<Value>,
  ): Observable<QueryResponse<Value, Error>> {
    const starter = new BehaviorSubject<void>(undefined);

    return new Observable((subscriber) => {
      subscriber.next({
        status: QueryStatus.loading,
      });

      return starter
        .pipe(
          withLatestFrom(this.data$),
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          filter(([, data]) => {
            if (data) {
              subscriber.next({
                status: QueryStatus.loaded,
                data,
                refire: () => {
                  this.data$.next(null);
                  starter.next();
                },
              });
              return false;
            }
            return true;
          }),
          switchMap(() => fn()),
          tap((result) => {
            this.data$.next(result);

            subscriber.next({
              status: QueryStatus.loaded,
              data: result,
              refire: () => {
                this.data$.next(null);
                starter.next();
              },
            });
          }),
          catchError((err: Error) => {
            subscriber.next({
              status: QueryStatus.error,
              error: err,
              refire: () => {
                this.data$.next(null);
                starter.next();
              },
            });
            return of(null);
          }),
        )
        .subscribe();
    });
  }
}
