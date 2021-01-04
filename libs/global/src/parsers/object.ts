import { isEmpty, set, isObject } from "lodash/fp";
import * as e from 'fp-ts/lib/Either';
import * as o from 'fp-ts/lib/Option';
import { of, Observable } from "rxjs";

import { InvalidPayload, ParsingError, toParsingError } from "../types";

type FieldValidation = e.Either<unknown, unknown>;
type InputData<ReturnValue> = Readonly<Record<keyof ReturnValue, FieldValidation>>;
export type UnknownObject = Record<PropertyKey, unknown>;

export const parseObject = <ReturnValue extends object, Errors>(data: InputData<ReturnValue>):
  Observable<e.Either<ParsingError<InvalidPayload, Errors>, ReturnValue>> => {
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
    return of(e.left(toParsingError<InvalidPayload, Errors>(InvalidPayload, InvalidPayload, errors as Errors)));
  }

  return of(e.right(result as ReturnValue));

};

export const nonEmptyObject = (value: unknown): Observable<o.Option<UnknownObject>> => {
  const option = isObject(value) && !isEmpty(value) ? o.some(value as UnknownObject) : o.none;
  return of(option);
};