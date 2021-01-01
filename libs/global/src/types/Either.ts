import { Observable } from "rxjs";
import { filter, map } from "rxjs/operators";

type Left<Value> = Readonly<{
  __tag: 'Left';
  left: Value;
}>

type Right<Value> = Readonly<{
  __tag: 'Right';
  right: Value;
}>;

export type Either<LeftValue, RightValue> = Left<LeftValue> | Right<RightValue>;

export const isRight = <RightValue = unknown>(data: Either<unknown, RightValue>): data is Right<RightValue> => data.__tag === 'Right';
export const isLeft = <LeftValue = unknown>(data: Either<LeftValue, unknown>): data is Left<LeftValue> => data.__tag === 'Left';

export const toRight = <T>(data: unknown) => ({ __tag: 'Right', right: data as T }) as Either<T, never>;
export const toLeft = <T>(data: unknown) => ({ __tag: 'Left', left: data as T }) as Either<never, T>;

export const takeRight = <RightValue>(source: Observable<Either<unknown, RightValue>>) => {

  return source.pipe(
    filter(isRight),
    map((value) => value.right)
  );
};

export const takeLeft = <LeftValue>(source: Observable<Either<LeftValue, unknown>>) => {

  return source.pipe(
    filter(isLeft),
    map((value) => value.left)
  );
};