import * as e from 'fp-ts/lib/Either';
import { Observable, of, pipe } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';

export const toLeftObs = <T>(input: T) => {
  return of(e.left(input));
};

export const toRightObs = <T>(input: T) => {
  return of(e.right(input));
};

export const mapRight = pipe(
  filter(e.isRight),
  map((confirmedAsRight) => confirmedAsRight.right),
);

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
