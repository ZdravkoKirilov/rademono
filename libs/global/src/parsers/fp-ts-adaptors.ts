import * as e from 'fp-ts/lib/Either';
import { Observable, of, pipe } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';

export const toLeftObs = <T>(input: T) => {
  return of(e.left(input));
};

export const toRightObs = <T>(input: T) => {
  return of(e.right(input));
};

export const switchMapWithErrorForwarding = <Value, Error, Next>(
  next: (value: Value) => Observable<Next>,
) => (source$: Observable<e.Either<Error, Value>>) => {
  return source$.pipe(
    switchMap((mbNext) => {
      if (e.isLeft(mbNext)) {
        return of(mbNext);
      }

      return next(mbNext.right);
    }),
  );
};

export const mapRight = <Value, Error>() => (
  source$: Observable<e.Either<Error, Value>>,
) => {
  return new Observable<Value>((observer) => {
    return source$.subscribe({
      next(x) {
        if (e.isLeft(x)) {
          observer.next(x as any);
          observer.complete();
          return;
        }
        return observer.next(x.right);
      },
      error(error) {
        observer.error(error);
      },
      complete() {
        observer.complete();
      },
    });
  });
};

export const mapLeft = pipe(
  filter(e.isLeft),
  map((confirmedAsRight) => confirmedAsRight.left),
);

export const mapEither = <Value, Error, E, V>(
  onError: (error: Error) => E,
  onSuccess: (value: Value) => V,
) => (source$: Observable<e.Either<Error, Value>>) => {
  return source$.pipe(
    map((result) => {
      if (e.isLeft(result)) {
        return onError(result.left);
      }
      return onSuccess(result.right);
    }),
  );
};

export const switchMapEither = <Value, Error, E, V>(
  onError: (error: Error) => Observable<E>,
  onSuccess: (value: Value) => Observable<V>,
) => (source$: Observable<e.Either<Error, Value>>) => {
  return source$.pipe(
    switchMap((result) => {
      if (e.isLeft(result)) {
        return onError(result.left);
      }
      return onSuccess(result.right);
    }),
  );
};
