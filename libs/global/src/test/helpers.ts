import { get } from 'lodash/fp';

import { FieldError } from '../types';

export const breakTest = (message = 'This code shouldn`t be reached') => {
  throw new Error(message);
};

export const hasFieldError = (error: Error, field: string) => {
  const errors: FieldError[] = get('errors', error) || [];

  return !!errors.find((elem) => elem.property === field);
};
