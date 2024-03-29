import {
  BehaviorSubject,
  map,
  Observable,
  of,
  switchMap,
  withLatestFrom,
} from '@end/global';
import { QueryOrigin, QueryResponse, QueryStatus } from './useQuery';

export type PendingQuery = {
  confirm: () => void;
};

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

export const valueToQueryResponse = <T>(
  data: T,
  refresh = () => undefined,
): Observable<QueryResponse<T>> => {
  return of({
    status: QueryStatus.loaded,
    data,
    origin: QueryOrigin.cache,
    refresh: refresh,
    undo: () => undefined,
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
