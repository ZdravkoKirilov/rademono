import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, filter, switchMap } from 'rxjs/operators';
import { isNil } from 'lodash/fp';

export enum QueryStatus {
  loading = 'loading',
  error = 'error',
  loaded = 'loaded',
}

export type QueryResponse<Value = unknown, ErrorResponse = unknown> =
  | Readonly<{ status: QueryStatus.loading }>
  | Readonly<{ status: QueryStatus.error; error: ErrorResponse }>
  | Readonly<{ status: QueryStatus.loaded; data: Value }>;

export const useQuery = <Value, ErrorResponse>(
  fn: () => Observable<Value>,
): Observable<QueryResponse<Value, ErrorResponse>> => {
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
        catchError((err: ErrorResponse) => {
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

type CachedQueryParams<Value, InternalValue> = {
  query: () => Observable<Value>;
  cache: BehaviorSubject<InternalValue>;
  toInternal: (data: unknown) => Observable<InternalValue>;
  toExternal: (data: unknown) => Observable<Value>;
};

export const useCachedQuery = <Value, InternalValue, ErrorResponse>(
  params: CachedQueryParams<Value, InternalValue>,
): Observable<QueryResponse<Value, ErrorResponse>> => {
  return new Observable<QueryResponse<Value, ErrorResponse>>((subscriber) => {
    return params.cache
      .pipe(
        switchMap((cache) => {
          /* cache first approach */
          if (cache) {
            return params.toExternal(cache).pipe(
              map((reformatted) => {
                subscriber.next({
                  status: QueryStatus.loaded,
                  data: reformatted,
                });
                return reformatted;
              }),
            );
          }
          return of(null);
        }),
        /* only continue if value was not found in the cache */
        filter(isNil),
        switchMap(() => useQuery<Value, ErrorResponse>(() => params.query())),
        switchMap((response) => {
          if (response.status === QueryStatus.loaded) {
            return params.toInternal(response.data).pipe(
              map((reformatted) => {
                /* will refire the chain and take the value from the cache and
                notify the consumer about the change */
                params.cache.next(reformatted);
              }),
            );
          }
          /* notify the consumer that it's loading / has errored out */
          subscriber.next(response);
          return of(null);
        }),
      )
      .subscribe();
  });
};
