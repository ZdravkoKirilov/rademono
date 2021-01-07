import { Observable } from "rxjs";
import { switchMap } from "rxjs/operators";
import * as e from 'fp-ts/lib/Either';
import * as o from 'fp-ts/lib/Option';

export const foldEither = <LeftValue, RightValue>(
  onLeft: (leftValue: LeftValue) => Observable<unknown>,
  onRight: (rightValue: RightValue) => Observable<unknown>
) =>
  (source: Observable<e.Either<LeftValue, RightValue>>): ReturnType<typeof onLeft> | ReturnType<typeof onRight> => {
    return source.pipe(
      switchMap(result => {
        if (e.isLeft(result)) {
          return onLeft(result.left);
        }
        return onRight(result.right);
      })
    )
  }

export const foldOption = <Value>(
  onSome: (value: Value) => Observable<any>,
  onNone: () => Observable<any>
) =>
  (source: Observable<o.Option<Value>>): ReturnType<typeof onSome> | ReturnType<typeof onNone> => {
    return source.pipe(
      switchMap(result => {
        if (o.isNone(result)) {
          return onNone();
        }
        return onSome(result.value);
      })
    )
  }