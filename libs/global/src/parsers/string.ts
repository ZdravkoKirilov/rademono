import { isEmpty, isString } from 'lodash/fp';

import { CannotBeEmpty, MustBeAstring } from '../types/Errors';
import * as e from '../types/Either';

export const parseNonEmptyString = (input: unknown): e.Either<CannotBeEmpty | MustBeAstring, string> => {

  if (!isEmpty(input)) {
    return e.toLeft(CannotBeEmpty);
  }
  if (!isString(input)) {
    return e.toLeft(MustBeAstring);
  }

  return e.toRight(input);
};

export const parseOptionalString = (input: unknown): e.Either<MustBeAstring, string> => {

  if (!isString(input)) {
    return e.toLeft(MustBeAstring);
  }

  return e.toRight(input);
};