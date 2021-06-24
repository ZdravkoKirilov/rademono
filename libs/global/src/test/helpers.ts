import { ParsingError } from '../types';

export const breakTest = (message = 'This code shouldn`t be reached') => {
  throw new Error(message);
};

export const hasFieldError = (error: ParsingError, field: string) => {
  return !!error.errors.find((elem) => elem.property === field);
};
