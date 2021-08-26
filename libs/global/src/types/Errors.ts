import { ValidationError } from 'class-validator';
import { get } from 'lodash/fp';

export type FieldError = Pick<ValidationError, 'property' | 'constraints'> & {
  name: string;
  errors?: FieldError[];
};

type AnyError = {
  name: string;
  message: string;
};

const toFieldErrors = (
  source: ValidationError[] | ParsingError[] | FieldError[],
): FieldError[] => {
  return source.map((error: ValidationError | ParsingError | FieldError) => {
    if (error instanceof ParsingError) {
      return {
        property: error.message,
        constraints: {},
        name: ParsingError.prototype.name,
        errors: error.errors,
      };
    }
    return {
      property: error.property,
      constraints: error.constraints,
      name: get('contexts.name', error) || get('name', error), // localize key
    };
  });
};

type CustomErrorTypes =
  | 'InvalidAccessToken'
  | 'InvalidRefreshToken'
  | 'UnexpectedError'
  | 'InvalidFileType'
  | 'Unauthorized'
  | 'ParsingError'
  | 'InvalidLoginCode'
  | 'NameTaken'
  | 'EntityExists'
  | 'EntityNotFound';

export class DomainError extends Error {
  readonly name = 'DomainError';

  constructor(public message: CustomErrorTypes, public errors?: AnyError[]) {
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
  errors: FieldError[];

  constructor(
    public message: string,
    errors: ValidationError[] | ParsingError[] | FieldError[] = [],
    public context: { index?: number } = {},
  ) {
    super();
    this.errors = errors ? toFieldErrors(errors) : [];
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
  name: CustomErrorTypes; // localization key
  errors?: FieldError[] | AnyError[] | ParsingError;
  originalError?: Error;
};
