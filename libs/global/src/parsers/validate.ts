import { validate, ValidatorOptions } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { from, Observable, of } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { isNil, isObject, omit, get } from 'lodash';
import * as o from 'fp-ts/lib/Option';
import * as e from 'fp-ts/lib/Either';

import { MalformedPayloadError, ParsingError } from '../types';

const stripUndefinedFields = (obj: any) => {
  Object.keys(obj).forEach((key) => {
    if (isNil(get(obj, key))) {
      delete obj[key];
    }
  });
  return obj;
};

export type ClassType<T> = {
  new (...args: any[]): T;
};

export const validateObject = (
  data: Object,
  options: ValidatorOptions = {
    whitelist: true,
    forbidNonWhitelisted: true,
  },
) => from(validate(data, options));

export const parseToClass = <Subject = unknown, Target = ClassType<Object>>(
  data: Subject,
  targetClass: ClassType<Target>,
) => {
  return isObject(data)
    ? of(
        o.some(
          plainToClass(targetClass, data, { excludeExtraneousValues: true }),
        ),
      )
    : of(o.none);
};

export const parseAndValidateUnknown = <Subject = Object, Target = Object>(
  data: Subject,
  targetClass: ClassType<Target>,
  options: {
    validationOptions: ValidatorOptions;
  } = { validationOptions: { whitelist: true } },
): Observable<e.Either<MalformedPayloadError | ParsingError, Target>> => {
  return parseToClass(data, targetClass).pipe(
    switchMap((opt) => {
      if (o.isNone(opt)) {
        return of(e.left(new MalformedPayloadError()));
      }
      return validateObject(opt.value, options.validationOptions).pipe(
        map((errors) => {
          const wihoutBlankFields = stripUndefinedFields(opt.value) as Target;
          return errors.length
            ? e.left(new ParsingError('', errors))
            : e.right(wihoutBlankFields);
        }),
      );
    }),
  );
};

export const parseAndValidateObject = <Subject = Object, Target = Object>(
  data: Subject,
  targetClass: ClassType<Target>,
  options: {
    validationOptions: ValidatorOptions;
  } = { validationOptions: { whitelist: true } },
): Observable<e.Either<ParsingError, Target>> => {
  const asClass = plainToClass(targetClass, data, {
    excludeExtraneousValues: true,
  });
  const result = stripUndefinedFields(asClass) as Target;

  return validateObject(result, options.validationOptions).pipe(
    map((errors) => {
      return errors.length
        ? e.left(new ParsingError('', errors))
        : e.right(result);
    }),
  );
};
