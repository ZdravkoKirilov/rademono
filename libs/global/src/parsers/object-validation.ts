import { isEmpty } from "lodash/fp";
import { set } from "lodash/fp";
import { Observable } from "rxjs";
import { map } from 'rxjs/operators';
import { Either, isLeft, toLeft, toRight } from "../types";

type FieldValidation = Either<unknown, unknown>;
type InputData<ReturnValue> = Readonly<Record<keyof ReturnValue, FieldValidation>>;

export const withObjectValidation = <ReturnValue extends object, Errors>(data: InputData<ReturnValue>) =>
  (source: Observable<unknown>): Observable<Either<Errors, ReturnValue>> => {
    const entries = Object.entries<Either<unknown, unknown>>(data);
    const errors = {};
    const result = {};

    entries.forEach(([key, value]) => {
      if (isLeft(value)) {
        set(key, value.left, errors);
      } else {
        set(key, value.right, result);
      }

    }, {});

    if (!isEmpty(errors)) {
      return source.pipe(
        map(() => toLeft(errors))
      );
    }

    return source.pipe(
      map(() => toRight(result))
    )

  }