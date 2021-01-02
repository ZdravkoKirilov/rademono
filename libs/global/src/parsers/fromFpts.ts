import { Observable, of } from "rxjs";
import { filter, map } from "rxjs/operators";
import * as e from 'fp-ts/lib/Either';
import * as o from 'fp-ts/lib/Option';

export const unwrapRight = <RightValue>(callback: (value: RightValue) => unknown) => (source: Observable<e.Either<unknown, RightValue>>) => {

  return source.pipe(
    filter(e.isRight),
    map(res => callback(res.right))
  );
};

export const unwrapLeft = <LeftValue>(callback: (value: LeftValue) => unknown) => (source: Observable<e.Either<LeftValue, unknown>>) => {

  return source.pipe(
    filter(e.isLeft),
    map(res => callback(res.left))
  );
};

export const unwrapSome = <Value>(callback: (value: Value) => unknown) => (source: Observable<o.Option<Value>>) => {

  return source.pipe(
    filter(o.isSome),
    map(opt => callback(opt.value))
  );
};

export const unwrapNone = (callback: () => unknown) => (source: Observable<o.Option<unknown>>) => {

  return source.pipe(
    filter(o.isSome),
    map(() => callback())
  );
};