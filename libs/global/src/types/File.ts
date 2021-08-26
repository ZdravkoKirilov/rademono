import {
  isNumber,
  registerDecorator,
  ValidationOptions,
} from 'class-validator';
import { NonEmptyArray } from './Array';
import { Tagged } from './Tagged';

export type CustomFile = Tagged<'File', File>;

export const ensureIsFile = (file: any) => {
  return typeof file === 'object' && 'size' in file && 'name' in file;
};

const bytesToMB = (amount: number) => Math.round(amount / Math.pow(1024, 2));

export const hasCorrectSize = (
  file: CustomFile,
  [maxSize, minSize]: [number | undefined, number | undefined],
) => {
  const max = maxSize || Infinity;
  const min = minSize || 0;
  const fileSize = isNumber(file?.size) ? bytesToMB(file.size) : 0;

  return fileSize <= max && fileSize >= min;
};

export const hasFileType = (file: CustomFile, types: NonEmptyArray<string>) => {
  const fileType = file.name.split('.').pop();

  return !!fileType && types.includes(fileType);
};

function IsFile(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isCustomFile',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [propertyName],
      options: validationOptions,
      validator: {
        validate(value: any) {
          return ensureIsFile(value);
        },
      },
    });
  };
}

type MinMax = {
  maxSizeMB: number;
  minSizeMB: number;
};

function FileSize(validationOptions: ValidationOptions & Partial<MinMax>) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'fileSize',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [propertyName],
      options: validationOptions,
      validator: {
        validate(value: CustomFile) {
          return hasCorrectSize(value, [
            validationOptions.minSizeMB,
            validationOptions.maxSizeMB,
          ]);
        },
      },
    });
  };
}

function FileType(
  validationOptions: ValidationOptions & { types: NonEmptyArray<string> },
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'fileType',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [propertyName],
      options: validationOptions,
      validator: {
        validate(value: CustomFile) {
          return hasFileType(value, validationOptions.types);
        },
      },
    });
  };
}

export const CustomFile = { IsFile, FileSize, FileType };
