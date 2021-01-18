import { customAlphabet } from 'nanoid';
import { registerDecorator, ValidationOptions } from 'class-validator';

import { Tagged } from './Tagged';

export type NanoId = Tagged<'__NanoId__', string>;

const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTWXYZ';

const generate = <T extends NanoId>() =>
  (customAlphabet(alphabet, 6) as unknown) as T;

const validate = (source: string): source is NanoId =>
  Array.from(source).every((char) => alphabet.includes(char));

function IsNanoId(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isNanoId',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [propertyName],
      options: validationOptions,
      validator: {
        validate(value: any) {
          return validate(value);
        },
      },
    });
  };
}

export const NanoId = { generate, IsNanoId };
