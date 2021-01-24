import { ValidationError } from 'class-validator';

export enum GenericErrors {
  PayloadIsNotAnObject = 'PayloadIsNotAnObject',
}

type FieldError = Pick<ValidationError, 'property' | 'constraints'> & {
  name: string;
};

export const toFieldErrors = (source: ValidationError[]): FieldError[] => {
  return source.map((error) => ({
    property: error.property,
    constraints: error.constraints,
    name: error?.contexts?.name, // localize key
  }));
};

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

export class MalformedPayloadError extends Error {
  readonly name = 'MalformedPayload';

  constructor(public message: string = GenericErrors.PayloadIsNotAnObject) {
    super();
  }
}

export class InvalidCommandError extends Error {
  readonly name = 'InvalidCommand';

  constructor(public message: string) {
    super();
  }
}

export type CustomHttpException = {
  statusCode: number;
  message: string;
  name: string; // localization key
  errors?: FieldError[];
};

export const toHttpException = (data: CustomHttpException) => data;
