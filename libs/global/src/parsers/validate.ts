import { validate, ValidatorOptions } from 'class-validator';
import { classToPlain, plainToClass } from 'class-transformer';
import { forkJoin, from, Observable, of } from 'rxjs';
import { isUndefined } from 'lodash/fp';
import { switchMap, map } from 'rxjs/operators';
import { isNil, isObject, get } from 'lodash';
import * as o from 'fp-ts/lib/Option';
import * as e from 'fp-ts/lib/Either';

import { ParsingError } from '../types';

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

// eslint-disable-next-line @typescript-eslint/ban-types
type UnknownObject = {};

export const validateObject = (
  data: UnknownObject,
  options: ValidatorOptions = {
    whitelist: true,
    forbidNonWhitelisted: true,
  },
) => from(validate(data, options));

export const transformToClass = <
  Subject = unknown,
  Target = ClassType<UnknownObject>
>(
  targetClass: ClassType<Target>,
  data: Subject,
) => plainToClass(targetClass, data, { excludeExtraneousValues: true });

export const transformToPlain = <T = unknown>(targetClass: T) =>
  classToPlain(targetClass, { excludeExtraneousValues: true });

export const parseToClass = <
  Subject = unknown,
  Target = ClassType<UnknownObject>
>(
  data: Subject,
  targetClass: ClassType<Target>,
) => {
  return isObject(data)
    ? of(o.some(transformToClass(targetClass, data)))
    : of(o.none);
};

export const parseAndValidateUnknown = <
  Subject = UnknownObject,
  Target = UnknownObject
>(
  data: Subject,
  targetClass: ClassType<Target>,
  options: {
    validationOptions: ValidatorOptions;
  } = { validationOptions: { whitelist: true } },
): Observable<e.Either<ParsingError, Target>> => {
  return parseToClass(data, targetClass).pipe(
    switchMap((opt) => {
      if (o.isNone(opt)) {
        return of(e.left(new ParsingError('Payload is not an object')));
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

export const parseAndValidateManyUnknown = <
  Subject = UnknownObject,
  Target = UnknownObject
>(
  data: Subject[],
  targetClass: ClassType<Target>,
  options: {
    validationOptions: ValidatorOptions;
  } = { validationOptions: { whitelist: true } },
): Observable<e.Either<ParsingError, Target[]>> => {
  return forkJoin(
    data.map((elem) => {
      return parseAndValidateUnknown(elem, targetClass, options);
    }),
  ).pipe(
    map((results) => {
      if (results.every(e.isRight)) {
        return e.right(results.map((elem) => elem.right));
      }
      const remappedErrors = results
        .map((elem, index) => {
          if (e.isLeft(elem)) {
            return new ParsingError(elem.left.message, elem.left.errors, {
              index,
            });
          }
          return undefined;
        })
        .filter((elem) => !isUndefined(elem)) as ParsingError[];

      return e.left(
        new ParsingError('Parse error in collection', remappedErrors),
      );
    }),
  );
};

export const parseAndValidateObject = <
  Subject = UnknownObject,
  Target = UnknownObject
>(
  data: Subject,
  targetClass: ClassType<Target>,
  options: {
    validationOptions: ValidatorOptions;
  } = { validationOptions: { whitelist: true } },
): Observable<e.Either<ParsingError, Target>> => {
  const asClass = transformToClass(targetClass, data);
  const result = stripUndefinedFields(asClass) as Target;

  return validateObject(result, options.validationOptions).pipe(
    map((errors) => {
      return errors.length
        ? e.left(new ParsingError('', errors))
        : e.right(result);
    }),
  );
};
