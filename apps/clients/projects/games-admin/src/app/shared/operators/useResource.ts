import { map, switchMap, filter, withLatestFrom, take } from 'rxjs/operators';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { isNil } from 'lodash/fp';

import { QueryResponse, QueryStatus, useQuery } from './useQuery';

type Resourcing<Value, InternalValue> = {
  query: () => Observable<Value>;
  toInternal: (data: unknown) => Observable<InternalValue>;
  toExternal: (data: unknown) => Observable<Value>;
};

type MutateParams<ReturnValue, Cache, MutateError> = {
  operation: () => Observable<ReturnValue>;
  after: (
    cache: Cache,
    result: QueryResponse<ReturnValue, MutateError>,
  ) => Observable<Cache>;
};

export const useResource = <Value, InternalValue, Error>(
  config: Resourcing<Value, InternalValue>,
): {
  query$: Observable<QueryResponse<Value, Error>>;
  mutate: <ReturnValue, MutateError>(
    params: MutateParams<ReturnValue, InternalValue | null, MutateError>,
  ) => Observable<QueryResponse<ReturnValue, MutateError>>;
} => {
  const data$ = new BehaviorSubject<InternalValue | null>(null);

  const query$ = new Observable<QueryResponse<Value, Error>>((subscriber) => {
    return data$
      .pipe(
        switchMap((cache) => {
          if (cache) {
            return config.toExternal(cache).pipe(
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
        filter(isNil),
        switchMap(() => useQuery<Value, Error>(() => config.query())),
        switchMap((response) => {
          if (response.status === QueryStatus.loaded) {
            return config.toInternal(response.data).pipe(
              map((reformatted) => {
                data$.next(reformatted);
              }),
            );
          }
          subscriber.next(response);
          return of(null);
        }),
      )
      .subscribe();
  });

  const mutate = <ReturnValue, MutateError>(
    params: MutateParams<ReturnValue, InternalValue | null, MutateError>,
  ) =>
    new Observable<QueryResponse<ReturnValue, MutateError>>((subscriber) => {
      return useQuery<ReturnValue, MutateError>(() => params.operation())
        .pipe(
          withLatestFrom(data$),
          take(1),
          switchMap(([result, cache]) => {
            return params.after(cache, result).pipe(
              map((updatedCache) => {
                data$.next(updatedCache);
                return result;
              }),
            );
          }),
          map((result) => {
            subscriber.next(result);
          }),
        )
        .subscribe();
    });

  return {
    query$,
    mutate,
  };
};
