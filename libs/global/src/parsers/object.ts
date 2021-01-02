import { isEmpty, set, isObject } from "lodash/fp";
import * as e from 'fp-ts/lib/Either';
import * as o from 'fp-ts/lib/Option';

type FieldValidation = e.Either<unknown, unknown>;
type InputData<ReturnValue> = Readonly<Record<keyof ReturnValue, FieldValidation>>;
export type UnknownObject = Record<PropertyKey, unknown>;

export const parseObject = <ReturnValue extends object, Errors>(data: InputData<ReturnValue>):
  e.Either<Errors, ReturnValue> => {
    const entries = Object.entries<e.Either<unknown, unknown>>(data);
    const errors = {};
    const result = {};

    entries.forEach(([key, value]) => {
      if (e.isLeft(value)) {
        set(key, value.left, errors);
      } else {
        set(key, value.right, result);
      }

    }, {});

    if (!isEmpty(errors)) {
      return e.left(errors as Errors);
    }

    return e.right(result as ReturnValue);

  };

export const nonEmptyObject = (value: unknown): o.Option<UnknownObject> => {
  const option = isObject(value) && !isEmpty(value) ? o.some(value as UnknownObject) : o.none;
  return option;
};