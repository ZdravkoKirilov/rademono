import { isEmpty, isString } from 'lodash/fp';
import * as e from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/pipeable';

import { Never } from '../types/Never';

export const MustBeAstring = 'MustBeAString';
export const CannotBeEmpty = 'CannotBeEmpty';
export const StringTooShort = 'StringTooShort';
export const StringTooLong = 'StringTooLong';

export type MustBeAstring = typeof MustBeAstring;
export type CannotBeEmpty = typeof CannotBeEmpty;
export type StringTooShort = typeof StringTooShort;
export type StringTooLong = typeof StringTooLong;

export type StringOfLengthError = MustBeAstring | StringTooShort | StringTooLong;

export type StringOfLength<Min extends number, Max extends number> = Never<'StringOfLength'> & {
  min: Min,
  max: Max,
};

export const nonEmptyString = (input: unknown): e.Either<CannotBeEmpty | MustBeAstring, string> => {

  if (!isEmpty(input)) {
    return e.left(CannotBeEmpty);
  }
  if (!isString(input)) {
    return e.left(MustBeAstring);
  }

  return e.right(input as string);
};

export const optionalString = (input: unknown): e.Either<MustBeAstring, string> => {

  if (!isString(input)) {
    return e.left(MustBeAstring);
  }

  return e.right(input as string);
};

const withLength = <Min extends number, Max extends number>(min: Min, max: Max) => (value: string): e.Either<StringTooShort | StringTooLong, StringOfLength<Min, Max>> => {
  const length = value.length;
  if (length < min) {
    return e.left(StringTooShort);
  }
  if (length > max) {
    return e.left(StringTooLong);
  }
  return e.right((value as unknown) as StringOfLength<Min, Max>);
};

export const stringOfLength = <Min extends number, Max extends number>(min: Min, max: Max) => (
  value: unknown,
): e.Either<StringOfLengthError, StringOfLength<Min, Max>> => {

  return pipe(
    optionalString(value),
    e.chainW(withLength(min, max))
  ) as e.Either<StringOfLengthError, StringOfLength<Min, Max>>;
};