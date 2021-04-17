import { BehaviorSubject, Observable, of } from 'rxjs';
import { switchMap, map, withLatestFrom } from 'rxjs/operators';
import { noop } from 'lodash/fp';

import { QueryOrigin, QueryResponse, QueryStatus, useQuery } from './useQuery';

export type PendingQuery = {
  confirm: () => void;
};

type UseEffectParams<EffectResponse, Err> = {
  fn: () => Observable<EffectResponse>;
  readFromCache?: () => Observable<EffectResponse>;
  saveToCache: (data: QueryResponse<EffectResponse, Err>) => Observable<void>;
};

export abstract class AdvancedState<InternalValue> {
  private _data$ = new BehaviorSubject<InternalValue | undefined>(undefined);

  public data = this._data$.asObservable();

  useEffect<EffectResponse, Err>({
    fn,
    readFromCache,
    saveToCache,
  }: UseEffectParams<EffectResponse, Err>): Observable<
    QueryResponse<EffectResponse, Err>
  > {
    return this._data$.pipe(
      switchMap((cache) => {
        if (cache && readFromCache) {
          return readFromCache().pipe(
            map((convertedCache) => {
              return {
                status: QueryStatus.loaded,
                data: convertedCache,
                origin: QueryOrigin.cache,
                refresh: () => this._data$.next(undefined),
                undo: noop,
              } as const;
            }),
          );
        }
        return useQuery<EffectResponse, Err>(fn).pipe(
          switchMap((res) => {
            if (res.status === QueryStatus.loaded) {
              return saveToCache(res).pipe(map(() => res));
            }
            return of(res);
          }),
        );
      }),
    );
  }
}

export function useConfirm<Value, Err>(
  fn: () => Observable<QueryResponse<Value, Err>>,
): Observable<PendingQuery | QueryResponse<Value, Err>> {
  const confirmStep$ = new BehaviorSubject<1 | 2>(1);

  return confirmStep$.pipe(
    switchMap((step) => {
      if (step === 1) {
        return of({ confirm: () => confirmStep$.next(2) });
      }
      return fn();
    }),
  );
}

export const valueToQueryResponse = <T>(data: T, refresh = noop) => {
  return of({
    status: QueryStatus.loaded,
    data,
    origin: QueryOrigin.cache,
    refresh: refresh,
    undo: noop,
  } as QueryResponse<T>);
};

export const revertOnFail = <Value, Err, Cache>({
  cache$,
  fn,
}: {
  cache$: BehaviorSubject<Cache>;
  fn: (currentCache: Cache) => void;
}) => (source$: Observable<QueryResponse<Value, Err>>) => {
  return source$.pipe(
    withLatestFrom(cache$),
    map(([res, currentCache]) => {
      if (res.status === QueryStatus.error) {
        fn(currentCache);
      }
      return res;
    }),
  );
};
