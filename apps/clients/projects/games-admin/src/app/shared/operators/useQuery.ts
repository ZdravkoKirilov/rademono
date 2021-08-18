import {
  BehaviorSubject,
  catchError,
  map,
  noop,
  Observable,
  of,
  Subject,
  switchMap,
  takeUntil,
} from '@end/global';
import { RequestError } from '@libs/ui';

export enum QueryStatus {
  loading = 'loading',
  error = 'error',
  loaded = 'loaded',
}

export enum QueryOrigin {
  initial = 'initial',
  retry = 'retry',
  refresh = 'refresh',
  cache = 'cache',
  undo = 'undo',
}

export type QueryResponse<Value = unknown, ErrorResponse = RequestError> =
  | { status: QueryStatus.loading; origin: QueryOrigin; cancel: () => void }
  | {
      status: QueryStatus.error;
      error: ErrorResponse;
      origin: QueryOrigin;
      retry: () => void;
    }
  | {
      status: QueryStatus.loaded;
      data: Value;
      origin: QueryOrigin;
      refresh: () => void;
      undo: () => void;
    };

export const useQuery = <Value, ErrorResponse>(
  fn: () => Observable<Value>,
  undo?: () => Observable<Value>,
): Observable<QueryResponse<Value, ErrorResponse>> => {
  const refire$ = new BehaviorSubject<QueryOrigin>(QueryOrigin.initial);
  const cancel$ = new Subject();

  return new Observable<QueryResponse<Value, ErrorResponse>>((observer) => {
    observer.next({
      status: QueryStatus.loading,
      origin: QueryOrigin.initial,
      cancel: () => cancel$.next(undefined),
    });

    return refire$
      .pipe(
        switchMap((origin) => {
          return (origin === 'undo' && undo ? undo() : fn()).pipe(
            takeUntil(cancel$),
            map((result) => {
              observer.next({
                status: QueryStatus.loaded,
                data: result,
                origin,
                refresh: () => refire$.next(QueryOrigin.refresh),
                undo: () => (undo ? refire$.next(QueryOrigin.undo) : noop),
              } as const);
            }),
            catchError((err: ErrorResponse) => {
              observer.next({
                status: QueryStatus.error,
                error: err,
                origin,
                retry: () => refire$.next(QueryOrigin.retry),
              } as const);
              return of(null);
            }),
          );
        }),
      )
      .subscribe();
  });
};

/* export const useQuery = <Value, ErrorResponse>(
  fn: () => Observable<Value>,
  undo?: () => Observable<Value>,
  options = {
    timeout: 10000,
    delay: 1000,
  },
): Observable<QueryResponse<Value, ErrorResponse>> => {
  const refire$ = new BehaviorSubject<QueryOrigin>(QueryOrigin.initial);
  const cancel$ = new Subject();

  return refire$.pipe(
    switchMap((origin) => {
      const query$ = (origin === 'undo' && undo ? undo() : fn()).pipe(
        timeout(options.timeout),
        map((result) => {
          return {
            status: QueryStatus.loaded,
            data: result,
            origin,
            refresh: () => refire$.next(QueryOrigin.refresh),
            undo: () => (undo ? refire$.next(QueryOrigin.undo) : noop),
          } as const;
        }),
        catchError((err: ErrorResponse) => {
          return of({
            status: QueryStatus.error,
            error: err,
            origin,
            retry: () => refire$.next(QueryOrigin.retry),
          } as const);
        }),
      );

      return of(
        {
          origin,
          status: QueryStatus.idle,
          cancel: () => cancel$.next(),
        } as QueryResponse<Value, ErrorResponse>,
        {
          origin,
          status: QueryStatus.loading,
          cancel: () => cancel$.next(),
        } as QueryResponse<Value, ErrorResponse>,
      ).pipe(
        takeUntil(cancel$),
        // include the query result after the showLoader true line
        () => concat(query$),
        // throttle emissions so that we do not get loader appearing
        // if data arrives within 1 second
        throttleTime(options.delay, asyncScheduler, {
          leading: true,
          trailing: true,
        }),
        // this hack keeps loader up at least 1 second if data arrives
        // right after loader goes up
        concatMap((x: QueryResponse<Value, ErrorResponse>) =>
          x.status === QueryStatus.loading
            ? EMPTY.pipe(delay(options.delay), startWith(x))
            : of(x),
        ),
      );
    }),
  );
}; */
