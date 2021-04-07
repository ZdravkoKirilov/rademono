import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, switchMap, take, tap } from 'rxjs/operators';

import { QueryResponse, useQuery } from './useQuery';

type MutateParams<ReturnValue, Cache, MutateError> = {
  operation: () => Observable<ReturnValue>;
  cache: BehaviorSubject<Cache>;
  after: (
    cache: Cache,
    result: QueryResponse<ReturnValue, MutateError>,
  ) => Observable<Cache>;
  before?: (cache: Cache) => Observable<Cache>;
};

export const useMutation = <ReturnValue, ErrorResponse, InternalValue>(
  params: MutateParams<ReturnValue, InternalValue, ErrorResponse>,
): Observable<QueryResponse<ReturnValue, ErrorResponse>> => {
  return new Observable<QueryResponse<ReturnValue, ErrorResponse>>(
    (subscriber) => {
      let initialCache: InternalValue;

      return params.cache
        .pipe(
          take(1),
          switchMap((cache) => {
            initialCache = cache;
            return params.before ? params.before(cache) : of(cache);
          }),
          tap((recomputedCache) => {
            params.cache.next(recomputedCache);
          }),
          switchMap(() => {
            return useQuery<ReturnValue, ErrorResponse>(() =>
              params.operation(),
            );
          }),
          switchMap((result) => {
            subscriber.next(result);

            return params.after(initialCache, result).pipe(
              map((updatedCache) => {
                params.cache.next(updatedCache);
                return result;
              }),
            );
          }),
        )
        .subscribe();
    },
  );
};
