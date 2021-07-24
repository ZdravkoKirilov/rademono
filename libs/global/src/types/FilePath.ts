import {
  isEmpty,
  isString,
  registerDecorator,
  ValidationOptions,
} from 'class-validator';

import { NonEmptyArray } from './Array';
import { Tagged } from './Tagged';

export type FilePath<T extends NonEmptyArray<string>> = Tagged<
  '__FilePath__',
  T
> &
  string;

export const isFilePath = <T extends NonEmptyArray<string>>(
  source: unknown,
  extensions: T,
): source is FilePath<typeof extensions> => {
  return (
    isString(source) &&
    !isEmpty(source) &&
    extensions.some((ext) => source.endsWith(ext))
  );
};

function IsFilePath(
  validationOptions: ValidationOptions & { types: NonEmptyArray<string> },
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isFilePath',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [propertyName],
      options: validationOptions,
      validator: {
        validate(value: any) {
          return isFilePath(value, validationOptions.types);
        },
      },
    });
  };
}

export const FilePath = { IsFilePath };
