import { ValidationError } from 'class-validator';
import { isArray } from 'lodash/fp';

type FieldError = Pick<ValidationError, 'property' | 'constraints'> & {
  name: string;
};

type AnyError = {
  name: string;
  message: string;
};

const containsParsingErrors = (
  source: ParsingError[] | ValidationError[],
): source is Array<ParsingError> => {
  return source[0] instanceof ParsingError;
};

const toFieldErrors = (source: ValidationError[]): FieldError[] => {
  return source.map((error) => ({
    property: error.property,
    constraints: error.constraints,
    name: error?.contexts?.name, // localize key
  }));
};

export class DomainError extends Error {
  readonly name = 'DomainError';

  constructor(public message: string, public errors?: AnyError[]) {
    super();
  }
}

export class RepositoryError extends Error {
  readonly name = 'RepositoryError';

  constructor(public message: string, public error?: Error) {
    super();
  }
}

export class ParsingError extends Error {
  readonly name = 'ParsingError';
  errors: FieldError[] | ParsingError[];

  constructor(
    public message: string,
    errors?: ValidationError[] | ParsingError[],
  ) {
    super();

    if (isArray(errors)) {
      if (containsParsingErrors(errors)) {
        this.errors = errors;
      } else {
        this.errors = toFieldErrors(errors);
      }
    } else {
      this.errors = [];
    }
  }
}

export class UnexpectedError extends Error {
  readonly name = 'UnexpectedError';

  constructor(public message = 'Something went wrong', public error?: Error) {
    super();
  }
}

export type HttpApiError = {
  message: string;
  name: string; // localization key
  errors?: FieldError[] | AnyError[];
  originalError?: unknown;
};
