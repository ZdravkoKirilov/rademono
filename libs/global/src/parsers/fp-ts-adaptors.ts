import * as e from 'fp-ts/lib/Either';
import { of, pipe } from 'rxjs';
import { filter, map } from 'rxjs/operators';

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
