import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export enum QueryStatus {
  loading = 'loading',
  error = 'error',
  loaded = 'loaded',
}

type QueryResponse<Value = unknown, Error = unknown> =
  | Readonly<{ status: QueryStatus.loading }>
  | Readonly<{ status: QueryStatus.error; error: Error }>
  | Readonly<{ status: QueryStatus.loaded; data: Value }>;

export const useQuery = <Value, Error>(
  fn: () => Observable<Value>,
): Observable<QueryResponse<Value, Error>> => {
  return new Observable((subscriber) => {
    subscriber.next({
      status: QueryStatus.loading,
    });

    return fn()
      .pipe(
        map((result) => {
          subscriber.next({
            status: QueryStatus.loaded,
            data: result,
          });
          return result;
        }),
        catchError((err: Error) => {
          subscriber.next({
            status: QueryStatus.error,
            error: err,
          });
          return of(null);
        }),
      )
      .subscribe();
  });
};
