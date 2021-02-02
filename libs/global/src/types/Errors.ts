import { ValidationError } from 'class-validator';

type FieldError = Pick<ValidationError, 'property' | 'constraints'> & {
  name: string;
};

type AnyError = {
  name: string;
  message: string;
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

export class ParsingError extends Error {
  readonly name = 'ParsingError';
  errors: FieldError[];

  constructor(public message: string, errors?: ValidationError[]) {
    super();
    this.errors = errors ? toFieldErrors(errors) : [];
  }
}

export class UnexpectedError<Error = unknown> extends Error {
  readonly name = 'UnexpectedError';

  constructor(public message = 'Something went wrong', public error?: Error) {
    super();
  }
}

export class InvalidCommandError extends Error {
  readonly name = 'InvalidCommand';

  constructor(public message: string) {
    super();
  }
}

export type HttpApiError = {
  message: string;
  name: string; // localization key
  errors?: FieldError[] | AnyError[];
  originalError?: unknown;
};
