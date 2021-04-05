import { customAlphabet } from 'nanoid';
import { isString, pipe, entries, reduce } from 'lodash/fp';
import { registerDecorator, ValidationOptions } from 'class-validator';

import { Tagged } from './Tagged';

export type NanoId = Tagged<'__NanoId__', string>;

const mapping = {
  0: 'R',
  1: 'Z',
  2: '6',
  3: 'L',
  4: 'Q',
  5: 'G',
  6: 'K',
  7: 'A',
  8: '5',
  9: 'Y',
  A: '0',
  B: 'W',
  C: 'X',
  D: 'B',
  E: 'T',
  F: '1',
  G: '4',
  H: 'C',
  I: '2',
  J: 'P',
  K: 'D',
  L: '3',
  M: 'S',
  N: 'I',
  O: 'H',
  P: '7',
  Q: 'E',
  R: 'J',
  S: '8',
  T: 'N',
  W: 'M',
  X: 'F',
  Y: 'O',
  Z: '9',
} as const;

const alphabet = Object.keys(mapping).join('');

const generate = <T extends NanoId>() => customAlphabet(alphabet, 6)() as T;

const validate = (source: string): source is NanoId =>
  isString(source) &&
  source.length === 6 &&
  Array.from(source).every((char) => alphabet.includes(char));

const encode = (source: NanoId): NanoId => {
  return source
    .split('')
    .map((char) => mapping[char as keyof typeof mapping])
    .join('') as NanoId;
};

const decode = (source: NanoId): NanoId => {
  const reversedMapping = pipe(
    entries,
    reduce((acc: { [key: string]: string }, [key, value]: [string, string]) => {
      acc[value] = key;
      return acc;
    }, {}),
  )(mapping);

  return source
    .split('')
    .map((char) => reversedMapping[char])
    .join('') as NanoId;
};

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

export const NanoId = { generate, IsNanoId, encode, decode };
