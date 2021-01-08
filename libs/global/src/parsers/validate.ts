import { validate, ValidatorOptions } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { from, Observable, of } from "rxjs";
import { switchMap, map } from 'rxjs/operators';
import { isObject } from 'lodash';
import * as o from 'fp-ts/lib/Option';
import * as e from 'fp-ts/lib/Either';

import { MalformedPayloadError, ParsingError } from '../types';

export type ClassType<T> = {
  new(...args: any[]): T;
};

const validateObject = (data: Object, options: ValidatorOptions = { whitelist: true }) =>
  from(validate(data, options));

const parseToClass = <Subject = unknown, Target = Object>(data: Subject, targetClass: ClassType<Target>) => {
  return isObject(data) ? of(o.some(plainToClass(targetClass, data, { excludeExtraneousValues: true }))) : of(o.none);
}

export const parseAndValidateUnknown = <Subject = Object, Target = Object>(
  data: Subject,
  targetClass: ClassType<Target>,
  options: {
    validationOptions: ValidatorOptions,
  } = { validationOptions: { whitelist: true } }
): Observable<e.Either<MalformedPayloadError | ParsingError, Target>> => {
  return parseToClass(data, targetClass).pipe(
    switchMap(opt => {
      if (o.isNone(opt)) {
        return of(e.left(new MalformedPayloadError()));
      }
      return validateObject(opt.value, options.validationOptions).pipe(
        map(errors => errors.length ? e.left(new ParsingError('', errors)) : e.right(opt.value))
      );
    }),
  )
};

export const parseAndValidateObject = <Subject = Object, Target = Object>(
  data: Subject,
  targetClass: ClassType<Target>,
  options: {
    validationOptions: ValidatorOptions,
  } = { validationOptions: { whitelist: true } }
): Observable<e.Either<ParsingError, Target>> => {

  const asClass = plainToClass(targetClass, data, { excludeExtraneousValues: true });

  return validateObject(asClass, options.validationOptions).pipe(
    map(errors => errors.length ? e.left(new ParsingError('', errors)) : e.right(asClass))
  );
};